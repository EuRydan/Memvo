import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateVoucherCode } from '@/lib/voucher-generator'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Mapeamento dos pacotes
const PACKAGES = {
  pack_5: { rawPrice: 590.00, count: 5, plan: 'classic' },
  pack_10: { rawPrice: 990.00, count: 10, plan: 'classic' },
  pack_20: { rawPrice: 1580.00, count: 20, plan: 'classic' }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''

    const body = await request.json()
    const { pack, userId, formData, ...brickParams } = body
    const paymentData = formData || brickParams

    if (!PACKAGES[pack as keyof typeof PACKAGES]) {
      return NextResponse.json({ error: 'Pacote inválido' }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseServiceKey || !accessToken) {
      return NextResponse.json({ error: 'Servidor mal configurado (chaves faltando)' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
    }

    // Check user role
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (user?.user_metadata?.role !== 'partner') {
      return NextResponse.json({ error: 'Conta não autorizada. Apenas parceiros podem comprar lotes B2B.' }, { status: 403 })
    }

    const packData = PACKAGES[pack as keyof typeof PACKAGES]

    // 1. Inicializar SDK do Mercado Pago
    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    // 2. Criar Pagamento
    const paymentResponse = await paymentClient.create({
      body: {
        transaction_amount: packData.rawPrice,
        token: paymentData.token,
        description: `Memvo B2B - Lote de ${packData.count} Chaves`,
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification
        },
        external_reference: `${userId}|b2b_${pack}`
      }
    })

    // 3. Se aprovado instantaneamente (cartão) gerar vouchers
    // Para PIX, geramos os vouchers após a notificação no Webhook
    if (paymentResponse.status === 'approved') {
      const newVouchers = []
      
      for (let i = 0; i < packData.count; i++) {
        let isUnique = false
        let newCode = ''
        let attempts = 0
        
        while (!isUnique && attempts < 10) {
          newCode = generateVoucherCode()
          const { data } = await supabase.from('vouchers').select('id').eq('code', newCode).single()
          if (!data) {
            isUnique = true
          }
          attempts++
        }

        newVouchers.push({
          code: newCode,
          purchaser_id: userId,
          plan_type: packData.plan,
          status: 'available'
        })
      }

      const { error: insertError } = await supabase.from('vouchers').insert(newVouchers)

      if (insertError) {
        console.error('Erro ao inserir vouchers:', insertError)
        return NextResponse.json({ error: 'Pagamento aprovado, mas erro ao gerar chaves. Contate o suporte.' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id,
      status: paymentResponse.status
    })

  } catch (error: any) {
    console.error('Erro checkout b2b:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
