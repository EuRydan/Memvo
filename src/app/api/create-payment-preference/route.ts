import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const PLAN_NAMES = {
  freemium: 'Plano Free',
  essential: 'Plano Essencial',
  classic: 'Plano Clássico',
  premium: 'Plano Premium'
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não está configurado.')
      return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 503 })
    }

    const { plan, userId, price } = await request.json()

    if (!plan || !userId || price === undefined) {
      return NextResponse.json({ error: 'Faltam dados: plan, userId ou price.' }, { status: 400 })
    }

    // Inicializa o SDK
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    // Ajusta a URL de notificação. Geralmente deve ser a URL de produção,
    // mas se estivermos num ambiente Vercel, podemos pegar do request se não houver hardcoded.
    // O MercadoPago exige uma URL pública.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memvo.com.br'
    const notificationUrl = process.env.MERCADOPAGO_WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`

    const response = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: PLAN_NAMES[plan as keyof typeof PLAN_NAMES] || 'Plano Memvo',
            quantity: 1,
            unit_price: Number(price),
            currency_id: 'BRL',
          }
        ],
        external_reference: `${userId}|${plan}`,
        notification_url: notificationUrl,
        statement_descriptor: 'MEMVO',
        back_urls: {
          success: `${baseUrl}/dashboard/success?plan=${plan}`,
          pending: `${baseUrl}/dashboard/success?plan=${plan}`,
          failure: `${baseUrl}/pricing`,
        },
        auto_return: 'approved',
      }
    })

    return NextResponse.json({
      success: true,
      preferenceId: response.id
    })

  } catch (error: any) {
    console.error('Erro ao criar preferência:', error)
    return NextResponse.json({ error: 'Falha ao conectar com Mercado Pago' }, { status: 500 })
  }
}
