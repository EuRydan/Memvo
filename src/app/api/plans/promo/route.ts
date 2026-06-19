import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { PROMO_PLANS } from '@/lib/limits'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, eventId } = await request.json()

    if (!planId || !eventId) {
      return NextResponse.json({ error: 'Missing planId or eventId' }, { status: 400 })
    }

    if (!(PROMO_PLANS as readonly string[]).includes(planId)) {
      return NextResponse.json({ error: 'Plano promocional inválido' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: event } = await supabaseAdmin
      .from('events')
      .select('id, owner_id')
      .eq('id', eventId)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { error: planError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: user.id,
        plan_id: planId,
        payment_id: `promo-${planId}-${Date.now()}`,
        event_id: eventId,
      })

    if (planError && planError.code !== '23505') {
      console.error('Erro ao inserir plano promo:', planError)
      return NextResponse.json({ error: 'Erro ao ativar plano' }, { status: 500 })
    }

    await supabaseAdmin
      .from('events')
      .update({ active: true, status: 'published' })
      .eq('id', eventId)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Promo plan activation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
