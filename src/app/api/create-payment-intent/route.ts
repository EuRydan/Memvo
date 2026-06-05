import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const { plan } = await request.json()

    if (!plan) {
      return NextResponse.json({ error: 'Plano não fornecido' }, { status: 400 })
    }

    const prices: Record<string, number> = {
      essential: 7900,
      classic: 14900,
      premium: 24900,
    }

    const priceAmount = prices[plan] || 7900

    // Inicializa o Stripe dentro do handler
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      // @ts-ignore
      apiVersion: '2023-10-16',
    })

    // Cria o PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceAmount,
      currency: 'brl',
      // Permite gerenciar métodos de pagamento nativamente via Stripe Dashboard
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        plan: plan,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Erro ao criar PaymentIntent:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
