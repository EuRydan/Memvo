import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const PLAN_PRICES = {
  freemium: 0,
  essential: 59.90,
  classic: 119.90,
  premium: 169.90
}

const PLAN_NAMES = {
  freemium: 'Plano Free',
  essential: 'Plano Essencial',
  classic: 'Plano Clássico',
  premium: 'Plano Premium'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, eventId, voucher } = await request.json()

    if (!plan || !eventId) {
      return NextResponse.json({ error: 'Missing plan or eventId' }, { status: 400 })
    }

    let price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
    if (price === undefined) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Lógica simplificada de voucher: se o voucher for "MEMVO10", dá 10% de desconto
    if (voucher === 'MEMVO10') {
      price = price * 0.9
    }

    // Cria o intent no banco de dados
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .insert({
        user_id: user.id,
        event_id: eventId,
        plan_id: plan,
        amount: price,
        status: 'pending'
      })
      .select('id')
      .single()

    if (intentError) throw intentError

    // Se o preço for 0, não precisa de Mercado Pago (ex: Freemium)
    if (price === 0) {
       // Atualiza a intent e simula sucesso se necessário
       return NextResponse.json({
         success: true,
         intentId: intent.id,
         preferenceId: null // No preference needed for free
       })
    }

    // Inicializa o Mercado Pago SDK
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }
    
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memvo.com.br'
    const notificationUrl = process.env.MERCADOPAGO_WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`

    const response = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: PLAN_NAMES[plan as keyof typeof PLAN_NAMES] || 'Plano Memvo',
            quantity: 1,
            unit_price: Number(price.toFixed(2)),
            currency_id: 'BRL',
          }
        ],
        external_reference: intent.id, // O external_reference agora é o intentId, não "userId|planId"
        notification_url: notificationUrl,
        statement_descriptor: 'MEMVO',
        back_urls: {
          success: `${baseUrl}/dashboard/success?session_id=${intent.id}`,
          pending: `${baseUrl}/dashboard/success?session_id=${intent.id}`,
          failure: `${baseUrl}/pricing?eventId=${eventId}`,
        },
        auto_return: 'approved',
      }
    })

    return NextResponse.json({
      success: true,
      intentId: intent.id,
      preferenceId: response.id
    })

  } catch (error: any) {
    console.error('Create payment intent error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
