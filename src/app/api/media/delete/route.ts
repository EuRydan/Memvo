import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // First, get the storage path so we can delete the file from the bucket too
    const { data: media } = await supabaseAdmin
      .from('media')
      .select('storage_path')
      .eq('id', mediaId)
      .single()

    if (media && media.storage_path) {
      await supabaseAdmin.storage.from('media').remove([media.storage_path])
    }

    // Then delete from database
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
