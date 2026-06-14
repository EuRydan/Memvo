import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getPhotoLimit, isEventLocked, UserPlanRecord } from '@/lib/limits'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_id, storage_path, uploader_name, type, challenge_id } = body

    if (!event_id || !storage_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Gerenciar guest_id
    const cookieStore = await cookies()
    let guestId = cookieStore.get('memvor_guest_id')?.value

    if (!guestId) {
      guestId = crypto.randomUUID()
      cookieStore.set('memvor_guest_id', guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 ano
        sameSite: 'lax',
        path: '/'
      })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Obter dono do evento
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('owner_id, status, active')
      .eq('id', event_id)
      .single()

    if (eventError || !eventData) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 2. Obter planos do dono do evento (histórico por evento)
    // Atenção: usamos owner_id do evento, não o usuário autenticado (convidados não têm user_plans)
    const { data: ownerPlans } = await supabase
      .from('user_plans')
      .select('event_id, plan_id')
      .eq('user_id', eventData.owner_id)

    const userPlans: UserPlanRecord[] = ownerPlans || []

    // Plano mais recente para calcular limites de fotos
    const planId = userPlans.length > 0
      ? (userPlans.sort((a, b) => 0).find(p => p.event_id === event_id)?.plan_id
          || userPlans[userPlans.length - 1]?.plan_id
          || 'none')
      : 'none'

    // 3. Checar se o evento está bloqueado por falta de pagamento
    if (isEventLocked(event_id, userPlans, eventData)) {
      return NextResponse.json({ error: 'Evento bloqueado aguardando pagamento.' }, { status: 403 })
    }

    // 4. Checar limite absoluto de fotos por usuário
    const limit = getPhotoLimit(planId)
    
    if (limit !== Infinity) {
      // Conta o TOTAL de fotos enviadas por ESSE guest_id para ESTE challenge_id
      let query = supabase
        .from('media')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('guest_id', guestId)
        
      if (challenge_id) {
        query = query.eq('challenge_id', challenge_id)
      } else {
        query = query.is('challenge_id', null)
      }

      const { count, error: countError } = await query

      if (!countError && typeof count === 'number' && count >= limit) {
        return NextResponse.json({ error: 'Limite do plano atingido' }, { status: 403 })
      }
    }

    // 5. Anti-abuso (Rate Limit por tempo) para todos os planos
    // Ex: max 15 fotos por minuto por guest_id
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const { count: recentCount, error: recentError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event_id)
      .eq('guest_id', guestId)
      .gte('created_at', oneMinuteAgo)

    if (!recentError && typeof recentCount === 'number' && recentCount >= 15) {
      return NextResponse.json({ error: 'Muitos envios rápidos. Aguarde um minuto e tente novamente.' }, { status: 429 })
    }

    // 6. Inserir a mídia
    const { data: newMedia, error: dbError } = await supabase.from('media').insert({
      event_id,
      storage_path,
      uploader_name: uploader_name || null,
      type,
      challenge_id: challenge_id || null,
      guest_id: guestId
    }).select().single()

    if (dbError) {
      console.error('DB Insert Error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, media: newMedia })

  } catch (error: any) {
    console.error('Media Create Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
