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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceAmount,
      currency: 'brl',
      description: `Plano ${plan}`,
      metadata: { plan },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Erro ao criar Checkout Session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
