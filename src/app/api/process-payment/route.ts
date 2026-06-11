import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não está configurado.')
      return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 503 })
    }

    const body = await request.json()
    const { formData, intentId } = body

    if (!formData || !intentId) {
      return NextResponse.json({ error: 'Faltam dados do formulário.' }, { status: 400 })
    }

    // Inicializa o SDK
    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memvo.com.br'
    const notificationUrl = process.env.MERCADOPAGO_WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`

    const paymentResponse = await payment.create({
      body: {
        ...formData,
        external_reference: intentId,
        notification_url: notificationUrl,
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
    })

  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json({ error: 'Falha ao processar pagamento no Mercado Pago' }, { status: 500 })
  }
}
