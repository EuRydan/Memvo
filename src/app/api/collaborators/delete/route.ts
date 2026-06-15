import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { hasEventAccess } from '@/lib/limits'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { collaboratorId, eventId } = await request.json()

    if (!collaboratorId || !eventId) {
      return NextResponse.json({ error: 'Faltam dados obrigatórios.' }, { status: 400 })
    }

    // Must be owner to remove
    const access = await hasEventAccess(supabase, user.id, eventId)
    if (!access.isOwner) {
      return NextResponse.json({ error: 'Apenas o anfitrião pode remover equipe.' }, { status: 403 })
    }

    const { error } = await supabase
      .from('event_collaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('event_id', eventId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
