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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memvo.com.br'
    const notificationUrl = process.env.MERCADOPAGO_WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`

    const paymentResponse = await payment.create({
      body: {
        ...formData,
        external_reference: intent.id,
        notification_url: notificationUrl,
        statement_descriptor: 'MEMVO',
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
    })

  } catch (error: any) {
    console.error('Process payment intent error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
