import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getChallengeLimit, UserPlanRecord } from '@/lib/limits'

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, event_id, title, titles } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Missing event_id' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, supabaseKey)

    // Verify ownership
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select('owner_id')
      .eq('id', event_id)
      .single()

    if (eventError || !eventData || eventData.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user plans
    const { data: plansData } = await supabaseAdmin
      .from('user_plans')
      .select('event_id, plan_id')
      .eq('user_id', user.id)

    const userPlans: UserPlanRecord[] = plansData || []
    const planId = userPlans.find(p => p.event_id === event_id)?.plan_id
      || userPlans.find(p => p.event_id === null)?.plan_id
      || 'none'

    const limit = getChallengeLimit(planId)

    if (action === 'add') {
      if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
      
      const { count } = await supabaseAdmin
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)

      const currentCount = count || 0
      
      if (limit !== Infinity && currentCount >= limit) {
        return NextResponse.json({ error: 'Limite de desafios atingido' }, { status: 403 })
      }

      const { data, error } = await supabaseAdmin
        .from('challenges')
        .insert({ event_id, title: title.trim(), order_index: currentCount })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data })
    } 
    
    if (action === 'load_defaults') {
      if (!Array.isArray(titles)) return NextResponse.json({ error: 'Missing titles array' }, { status: 400 })
      
      // Delete existing
      await supabaseAdmin.from('challenges').delete().eq('event_id', event_id)

      // Insert up to limit
      const challengesToInsert = limit === Infinity ? titles : titles.slice(0, limit)
      const toInsert = challengesToInsert.map((t, i) => ({ event_id, title: t, order_index: i }))
      
      const { data, error } = await supabaseAdmin
        .from('challenges')
        .insert(toInsert)
        .select()

      if (error) throw error
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
