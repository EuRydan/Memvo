import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plan, formData, ...brickParams } = body

    // brickParams contém os dados enviados pelo Brick (token, payment_method_id, issuer_id, installments, payer, etc)
    // O brick de pagamento envia formData dentro do onSubmit na v2
    // Pode vir direto na raiz do param dependendo da versão, então pegamos tudo e agrupamos
    const paymentData = formData || brickParams

    if (!plan || !paymentData.payment_method_id || !paymentData.payer) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const prices: Record<string, number> = {
      essential: 79.00,
      classic: 149.00,
      premium: 249.00,
    }

    const priceAmount = prices[plan] || 79.00

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken || accessToken === 'seu_access_token_aqui') {
      // MOCK SUCCESS para testes quando não há chave configurada
      return NextResponse.json({
        success: true,
        paymentId: "mock_payment_123"
      })
    }

    // 1. Inicializar SDK do Mercado Pago
    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    // 2. Criar Pagamento
    const response = await paymentClient.create({
      body: {
        transaction_amount: priceAmount,
        token: paymentData.token,
        description: `Memvo - Plano ${plan}`,
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification
        },
        external_reference: `${user.id}|${plan}`
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: response.id,
      status: response.status,
      status_detail: response.status_detail
    })

  } catch (error: any) {
    console.error('Erro geral no checkout:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
