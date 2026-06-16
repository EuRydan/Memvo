import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getPhotoLimit, isEventLocked, UserPlanRecord } from '@/lib/limits'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_id, file_ext, file_size, challenge_id, is_cover } = body

    if (!event_id || !file_ext || !file_size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isVideo = file_ext && ['mp4', 'mov', 'webm'].includes(file_ext.toLowerCase())
    const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
    const MAX_VIDEO_SIZE = 150 * 1024 * 1024 // 150MB

    if (isVideo && file_size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Video exceeds 150MB limit' }, { status: 400 })
    } else if (!isVideo && file_size > MAX_PHOTO_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
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
    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, supabaseKey)
    const supabaseServer = await createClient()

    // 1. Obter dono do evento
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select('owner_id, status, active')
      .eq('id', event_id)
      .single()

    if (eventError || !eventData) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 2. Obter planos do dono do evento (histórico por evento)
    // Atenção: usamos owner_id do evento, não o usuário autenticado (convidados não têm user_plans)
    const { data: ownerPlans } = await supabaseAdmin
      .from('user_plans')
      .select('event_id, plan_id')
      .eq('user_id', eventData.owner_id)

    const userPlans: UserPlanRecord[] = ownerPlans || []

    // Plano para cálculo de limites: preferir o vinculado ao evento, fallback para plano global (legado) se existir
    const planId = userPlans.find(p => p.event_id === event_id)?.plan_id
      || userPlans.find(p => p.event_id === null)?.plan_id
      || 'none'

    // 3. Checar bloqueio de pagamento (se não for dono)
    // Se for o dono (ex: fazendo upload de capa), não bloqueamos o pre-sign da capa (pode alterar no rascunho)
    const { data: { user } } = await supabaseServer.auth.getUser()
    const isOwner = user?.id === eventData.owner_id
    
    if (!isOwner && !is_cover) {
      if (isEventLocked(event_id, userPlans, eventData)) {
        return NextResponse.json({ error: 'Evento bloqueado aguardando pagamento.' }, { status: 403 })
      }
    }

    // 4. Checar limites e rate limit APENAS para mídia de convidados
    if (!is_cover) {
      const limit = getPhotoLimit(planId)
      
      if (limit !== Infinity) {
        let query = supabaseAdmin.from('media').select('*', { count: 'exact', head: true }).eq('event_id', event_id).eq('guest_id', guestId)
        if (challenge_id) query = query.eq('challenge_id', challenge_id)
        else query = query.is('challenge_id', null)
  
        const { count, error: countError } = await query
        if (!countError && typeof count === 'number' && count >= limit) {
          return NextResponse.json({ error: 'Limite do plano atingido' }, { status: 403 })
        }
      }
  
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
      const { count: recentCount, error: recentError } = await supabaseAdmin.from('media').select('*', { count: 'exact', head: true }).eq('event_id', event_id).eq('guest_id', guestId).gte('created_at', oneMinuteAgo)
  
      if (!recentError && typeof recentCount === 'number' && recentCount >= 15) {
        return NextResponse.json({ error: 'Muitos envios rápidos. Aguarde um minuto e tente novamente.' }, { status: 429 })
      }
    } else if (!isOwner) {
      // Somente o dono pode alterar a capa
      return NextResponse.json({ error: 'Unauthorized to upload cover' }, { status: 401 })
    }

    // 6. Gerar Signed URL para o upload
    const prefix = is_cover ? 'covers' : event_id
    const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file_ext}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .createSignedUploadUrl(fileName)

    if (uploadError || !uploadData) {
      console.error('Storage Presign Error:', uploadError)
      return NextResponse.json({ error: 'Storage presign error' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      signedUrl: uploadData.signedUrl,
      token: uploadData.token,
      path: uploadData.path
    })

  } catch (error: any) {
    console.error('Media Presign Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
