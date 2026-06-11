import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

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

    const { intentId, couponCode } = await request.json()

    if (!intentId || !couponCode) {
      return NextResponse.json({ error: 'Missing intentId or couponCode' }, { status: 400 })
    }

    // 1. Validar o Cupom
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('affiliate_code, status, name')
      .eq('affiliate_code', couponCode)
      .maybeSingle()

    if (!affiliate || affiliate.status !== 'approved') {
      return NextResponse.json({ error: 'Cupom inválido ou inativo.' }, { status: 404 })
    }

    // 2. Buscar a intent atual
    const { data: intent } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .eq('user_id', user.id)
      .single()

    if (!intent) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 })
    }

    if (intent.affiliate_code) {
      return NextResponse.json({ error: 'Um cupom já foi aplicado a esta compra.' }, { status: 400 })
    }

    // 3. Calcular novo valor (10% desconto)
    const newAmount = Number(intent.amount) * 0.90

    // 4. Gerar nova Preference no Mercado Pago
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
            id: intent.plan_id,
            title: PLAN_NAMES[intent.plan_id as keyof typeof PLAN_NAMES] || 'Plano Memvo (Com Desconto)',
            quantity: 1,
            unit_price: Number(newAmount.toFixed(2)),
            currency_id: 'BRL',
          }
        ],
        external_reference: intent.id,
        notification_url: notificationUrl,
        statement_descriptor: 'MEMVO',
        back_urls: {
          success: `${baseUrl}/dashboard/success?session_id=${intent.id}`,
          pending: `${baseUrl}/dashboard/success?session_id=${intent.id}`,
          failure: `${baseUrl}/pricing?eventId=${intent.event_id}`,
        },
        auto_return: 'approved',
      }
    })

    if (!response.id) {
      throw new Error('Failed to create Mercado Pago preference')
    }

    // 5. Atualizar Intent no DB
    await supabase
      .from('payment_intents')
      .update({
        amount: newAmount,
        affiliate_code: affiliate.affiliate_code
      })
      .eq('id', intentId)

    return NextResponse.json({
      success: true,
      newAmount,
      newPreferenceId: response.id,
      partnerName: affiliate.name
    })

  } catch (error: any) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Erro interno ao aplicar cupom' }, { status: 500 })
  }
}
