import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { intentId } = await request.json()
    if (!intentId) {
      return NextResponse.json({ error: 'Missing intentId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, supabaseServiceKey)

    const { data: intent, error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (intentError || !intent) {
      return NextResponse.json({ error: 'Intent not found or unauthorized' }, { status: 404 })
    }

    if (Number(intent.amount) !== 0) {
      return NextResponse.json({ error: 'This route is only for free plans' }, { status: 400 })
    }

    if (intent.status === 'approved') {
      return NextResponse.json({ success: true, alreadyActivated: true })
    }

    // Activate plan and event
    await supabaseAdmin
      .from('payment_intents')
      .update({ status: 'approved', processed_at: new Date().toISOString(), mp_payment_id: `free-${intentId}` })
      .eq('id', intentId)

    const { error: planError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: intent.user_id,
        plan_id: intent.plan_id,
        payment_id: `free-${intentId}`,
        event_id: intent.event_id
      })

    if (planError && planError.code !== '23505') {
      console.error('Erro ao inserir plano free:', planError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    await supabaseAdmin
      .from('events')
      .update({ active: true, status: 'published' })
      .eq('id', intent.event_id)

    console.log(`Plano ${intent.plan_id} (free) e evento ${intent.event_id} ativados para ${user.id}`)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Activate free plan error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
