import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLAN_PRICES = {
  freemium: 0,
  essential: 1.00,
  classic: 149.00,
  premium: 249.00
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

    // Busca o plano atual para ESTE evento específico
    const { data: currentPlan } = await supabase
      .from('user_plans')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (currentPlan && currentPlan.plan_id) {
      const currentPrice = PLAN_PRICES[currentPlan.plan_id as keyof typeof PLAN_PRICES] || 0
      
      // Temporarily bypass the upgrade check for testing
      // if (price <= currentPrice) {
      //   return NextResponse.json({ error: 'Você já possui este plano ou um superior' }, { status: 400 })
      // }
      
      // Cobra apenas a diferença
      // price = price - currentPrice // BYPASSED PARA TESTE
    }

    // Voucher validation (Affiliate logic)
    let appliedAffiliateCode = null

    if (voucher) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('user_id, affiliate_code, status')
        .eq('affiliate_code', voucher)
        .maybeSingle()

      // Ensure the affiliate is approved and is NOT the user themselves
      if (affiliate && affiliate.status === 'approved' && affiliate.user_id !== user.id) {
        // Apply 10% discount
        price = price * 0.90
        appliedAffiliateCode = affiliate.affiliate_code
      }
    }

    // Cria o intent no banco de dados
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .insert({
        user_id: user.id,
        event_id: eventId,
        plan_id: plan,
        amount: price,
        status: 'pending',
        affiliate_code: appliedAffiliateCode
      })
      .select('id')
      .single()

    if (intentError) throw intentError

    return NextResponse.json({
      success: true,
      intentId: intent.id,
      amount: Number(price.toFixed(2)),
      description: PLAN_NAMES[plan as keyof typeof PLAN_NAMES] || 'Plano Memvo'
    })

  } catch (error: any) {
    console.error('Init payment intent error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
