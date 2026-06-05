import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: Request) {
  // Inicializa o Stripe dentro do handler para não quebrar o build do Next.js
  // caso a variável de ambiente não esteja presente no servidor da Vercel.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    // @ts-ignore
    apiVersion: '2023-10-16', 
  })

  const { searchParams } = new URL(request.url)
  const plan = searchParams.get('plan')

  if (!plan) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  // Preços configurados (em centavos, R$79 = 7900)
  const prices: Record<string, number> = {
    essential: 7900,
    classic: 14900,
    premium: 24900,
  }

  const priceAmount = prices[plan] || 7900
  const origin = request.headers.get('origin') || new URL(request.url).origin

  try {
    // Cria a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} - Memvo`,
              description: 'Pagamento único para criar seu álbum de celebração.',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Redireciona de volta para a página de registro com o ID da sessão
      success_url: `${origin}/register?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${origin}/pricing`,
    })

    // Redireciona o usuário para a página de pagamento hospedada pelo Stripe
    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    return NextResponse.json({ error: 'Falha ao criar sessão' }, { status: 500 })
  } catch (error: any) {
    console.error('Erro no Stripe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
