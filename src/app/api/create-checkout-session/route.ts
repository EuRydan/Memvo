import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['essential', 'classic', 'premium']),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Plano inválido fornecido', details: parsed.error.format() }, { status: 400 })
    }

    const { plan } = parsed.data

    const prices: Record<string, number> = {
      essential: 7900,
      classic: 14900,
      premium: 24900,
    }

    const priceAmount = prices[plan] || 7900

    // Inicializa o Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    const stripe = new Stripe(stripeKey, {
      // @ts-ignore
      apiVersion: '2026-05-27.dahlia',
    })

    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const returnUrl = `${protocol}://${host}/dashboard/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`

    // Cria a Checkout Session com ui_mode elements
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'elements',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${plan}`,
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: returnUrl,
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
    })
  } catch (error: any) {
    console.error('Erro ao criar Checkout Session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
