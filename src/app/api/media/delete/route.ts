import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { mediaId } = await req.json()

    if (!mediaId) {
      return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch the media row to check ownership before deleting
    const { data: media } = await supabaseAdmin
      .from('media')
      .select('storage_path, event_id, guest_id')
      .eq('id', mediaId)
      .single()

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Determine if the requester is authorized:
    // Case 1 — authenticated user who owns the event (dashboard)
    // Case 2 — guest who uploaded this specific media (event page)
    let authorized = false

    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (user) {
      const { data: event } = await supabaseAdmin
        .from('events')
        .select('owner_id')
        .eq('id', media.event_id)
        .single()

      if (event?.owner_id === user.id) {
        authorized = true
      }
    }

    if (!authorized) {
      const cookieStore = await cookies()
      const guestId = cookieStore.get('memvor_guest_id')?.value
      if (guestId && guestId === media.guest_id) {
        authorized = true
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (media.storage_path) {
      await supabaseAdmin.storage.from('media').remove([media.storage_path])
    }

    const { error } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('id', mediaId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete API Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
