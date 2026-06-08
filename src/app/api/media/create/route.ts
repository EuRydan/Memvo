import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getPhotoLimit } from '@/lib/limits'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_id, storage_path, uploader_name, type, challenge_id } = body

    if (!event_id || !storage_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Gerenciar guest_id
    const cookieStore = cookies()
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
      .select('owner_id')
      .eq('id', event_id)
      .single()

    if (eventError || !eventData) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 2. Obter plano do dono
    const { data: planData } = await supabase
      .from('user_plans')
      .select('plan_id')
      .eq('user_id', eventData.owner_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const planId = planData?.plan_id || 'none'
    const limit = getPhotoLimit(planId)

    // 3. Checar limite se não for ilimitado
    if (limit !== Infinity) {
      // Conta as fotos enviadas por ESSE guest_id para ESTE challenge_id
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

    // 4. Inserir a mídia
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
