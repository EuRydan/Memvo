import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { formData, intentId } = body

    if (!formData || !intentId) {
      return NextResponse.json({ error: 'Missing formData or intentId' }, { status: 400 })
    }

    // Verifica a propriedade do intent
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .eq('user_id', user.id)
      .single()

    if (intentError || !intent) {
      return NextResponse.json({ error: 'Intent not found or unauthorized' }, { status: 404 })
    }

    // Inicializa o SDK
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }
    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memvor.app'
    const notificationUrl = process.env.MERCADOPAGO_WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`

    const payload = {
      body: {
        ...formData,
        transaction_amount: Number(intent.amount),
        description: `Plano ${intent.plan_id.toUpperCase()} - Memvo`,
        external_reference: intent.id,
        notification_url: notificationUrl,
        statement_descriptor: 'MEMVO',
      }
    }

    console.log('[MERCADO PAGO PAYLOAD] Enviando requisição para criar pagamento:', JSON.stringify(payload, null, 2))
    console.log(`[MERCADO PAGO NOTIFICATION URL] ${notificationUrl} (MERCADOPAGO_WEBHOOK_URL: ${process.env.MERCADOPAGO_WEBHOOK_URL}, NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL})`)

    const paymentResponse = await payment.create(payload)

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
    })

  } catch (error: any) {
    console.error('Process payment intent error:', error)
    const errorMessage = error instanceof Error ? error.message : (error?.message || 'Unknown error')
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage, raw: error }, { status: 500 })
  }
}
