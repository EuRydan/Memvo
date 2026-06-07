import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateVoucherCode } from '@/lib/voucher-generator'
import { cookies } from 'next/headers'

// Mapeamento dos pacotes
const PACKAGES = {
  pack_5: { price: 590.00, count: 5, plan: 'classic' },
  pack_10: { price: 990.00, count: 10, plan: 'classic' },
  pack_20: { price: 1580.00, count: 20, plan: 'classic' }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
    const asaasKey = process.env.ASAAS_API_KEY || ''

    const body = await request.json()
    const { pack, paymentMethod, customer, card } = body

    if (!PACKAGES[pack as keyof typeof PACKAGES]) {
      return NextResponse.json({ error: 'Pacote inválido' }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseServiceKey || !asaasKey) {
      return NextResponse.json({ error: 'Chaves de API não configuradas no servidor' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Pegar usuário autenticado via cookies (se usar supabase auth padrão)
    // Se não tiver o cookie configurado 100%, vamos aceitar o userId mandado no body como fallback para o MVP
    let purchaserId = body.userId

    if (!purchaserId) {
      const cookieStore = await cookies()
      const authCookie = cookieStore.get('sb-access-token') || cookieStore.get('supabase-auth-token')
      if (authCookie) {
        // Tentativa de pegar auth server side
        const { data: { user } } = await supabase.auth.getUser(authCookie.value)
        if (user) purchaserId = user.id
      }
    }

    if (!purchaserId) {
      return NextResponse.json({ error: 'Usuário não autenticado. Crie sua conta primeiro.' }, { status: 401 })
    }

    const packData = PACKAGES[pack as keyof typeof PACKAGES]

    const baseUrl = asaasKey.includes('sandbox') || process.env.NODE_ENV !== 'production'
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3'

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasKey
    }

    // 1. Criar Cliente no Asaas
    const customerResponse = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: customer.name,
        cpfCnpj: customer.cpf.replace(/\D/g, ''),
        email: customer.email
      })
    })

    if (!customerResponse.ok) {
      const err = await customerResponse.json()
      return NextResponse.json({ error: err.errors?.[0]?.description || 'Erro ao cadastrar cliente' }, { status: 400 })
    }

    const customerData = await customerResponse.json()
    const asaasCustomerId = customerData.id

    // 2. Criar Pagamento
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)

    const paymentPayload: any = {
      customer: asaasCustomerId,
      billingType: paymentMethod,
      value: packData.price,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Memvo B2B - Lote de ${packData.count} Chaves`,
    }

    if (paymentMethod === 'CREDIT_CARD' && card) {
      paymentPayload.creditCard = {
        holderName: card.holderName,
        number: card.number,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear.length === 2 ? `20${card.expiryYear}` : card.expiryYear,
        ccv: card.ccv
      }
      paymentPayload.creditCardHolderInfo = {
        name: customer.name,
        email: customer.email,
        cpfCnpj: customer.cpf.replace(/\D/g, ''),
        postalCode: '01001000',
        addressNumber: '0',
        addressComplement: 'ND',
        phone: '11999999999'
      }
    }

    const paymentResponse = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload)
    })

    if (!paymentResponse.ok) {
      const err = await paymentResponse.json()
      return NextResponse.json({ error: err.errors?.[0]?.description || 'Erro no pagamento Asaas' }, { status: 400 })
    }

    const paymentData = await paymentResponse.json()

    // 3. Se for PIX, retorna QR Code (a geração das chaves deve ser num Webhook pós-pagamento)
    if (paymentMethod === 'PIX') {
      const qrResponse = await fetch(`${baseUrl}/payments/${paymentData.id}/pixQrCode`, { headers })
      if (!qrResponse.ok) return NextResponse.json({ error: 'Erro ao gerar QR Code' }, { status: 400 })
      
      const qrData = await qrResponse.json()
      return NextResponse.json({
        success: true,
        pix: { encodedImage: qrData.encodedImage, payload: qrData.payload }
      })
    }

    // 4. Se Cartão de Crédito aprovado na hora (Opção B - Geração Instantânea)
    // Gerar os vouchers únicos no Supabase
    const newVouchers = []
    
    for (let i = 0; i < packData.count; i++) {
      let isUnique = false
      let newCode = ''
      let attempts = 0
      
      while (!isUnique && attempts < 10) {
        newCode = generateVoucherCode()
        // Checar se já existe (probabilidade ínfima, mas garantindo)
        const { data } = await supabase.from('vouchers').select('id').eq('code', newCode).single()
        if (!data) {
          isUnique = true
        }
        attempts++
      }

      newVouchers.push({
        code: newCode,
        purchaser_id: purchaserId,
        plan_type: packData.plan,
        status: 'available'
      })
    }

    const { error: insertError } = await supabase.from('vouchers').insert(newVouchers)

    if (insertError) {
      console.error('Erro ao inserir vouchers:', insertError)
      return NextResponse.json({ error: 'Pagamento aprovado, mas erro ao gerar chaves. Contate o suporte.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${packData.count} códigos gerados com sucesso!`,
      paymentId: paymentData.id
    })

  } catch (error: any) {
    console.error('Erro checkout b2b:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
