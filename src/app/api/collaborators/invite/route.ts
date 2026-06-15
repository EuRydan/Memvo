import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCollaboratorLimit, hasEventAccess } from '@/lib/limits'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { eventId, email } = await request.json()

    if (!eventId || !email) {
      return NextResponse.json({ error: 'Faltam dados obrigatórios.' }, { status: 400 })
    }

    // Must be owner to invite
    const access = await hasEventAccess(supabase, user.id, eventId)
    if (!access.isOwner) {
      return NextResponse.json({ error: 'Apenas o anfitrião pode convidar equipe.' }, { status: 403 })
    }

    // Get plan to check limits
    const { data: plansData } = await supabase
      .from('user_plans')
      .select('event_id, plan_id')
      .eq('user_id', user.id)

    const eventPlanId = plansData?.find(p => p.event_id === eventId)?.plan_id
      || plansData?.[plansData.length - 1]?.plan_id
      || 'none'

    const limit = getCollaboratorLimit(eventPlanId)
    
    if (limit.max === 0) {
      return NextResponse.json({ error: 'Seu plano não permite convidar co-anfitriões.' }, { status: 403 })
    }

    // Check current count
    const { count, error: countError } = await supabase
      .from('event_collaborators')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (countError) throw countError

    if ((count || 0) >= limit.max) {
      return NextResponse.json({ error: 'Limite de colaboradores atingido para o plano atual.' }, { status: 403 })
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from('event_collaborators')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já foi convidado.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('event_collaborators')
      .insert({
        event_id: eventId,
        email: email,
        invited_by: user.id,
        access_level: limit.accessLevel
      })
      .select('invite_token')
      .single()

    if (error) throw error

    // Return invite link
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://memvor.com'
    const inviteLink = `${origin}/convite/${data.invite_token}`

    return NextResponse.json({ inviteLink })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
