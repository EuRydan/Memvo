import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Verifies it's a Vercel cron request or passing our secret
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && request.headers.get('User-Agent') !== 'vercel-cron') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD

    // 1. Find all active events older than 30 days
    const { data: expiredEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, name')
      .lt('date', cutoffDate)
      .eq('active', true)

    if (eventsError) throw eventsError

    if (!expiredEvents || expiredEvents.length === 0) {
      return NextResponse.json({ message: 'No events to clean up.' })
    }

    const eventIds = expiredEvents.map(e => e.id)
    
    // 2. Fetch all media from these events
    const { data: medias, error: mediasError } = await supabase
      .from('media')
      .select('id, storage_path')
      .in('event_id', eventIds)

    if (mediasError) throw mediasError

    let deletedFiles = 0

    if (medias && medias.length > 0) {
      // 3. Delete files from Supabase Storage
      const paths = medias.map(m => m.storage_path)
      
      // Storage remove limit is usually around 100 per request, 
      // but since we are keeping it simple, let's chunk it by 100 just in case
      const chunkSize = 100
      for (let i = 0; i < paths.length; i += chunkSize) {
        const chunk = paths.slice(i, i + chunkSize)
        const { error: storageError } = await supabase.storage.from('media').remove(chunk)
        if (storageError) console.error('Storage deletion error:', storageError)
        else deletedFiles += chunk.length
      }

      // 4. Delete media records from database (or set storage_path to null, but deleting is better)
      const { error: dbMediaError } = await supabase
        .from('media')
        .delete()
        .in('id', medias.map(m => m.id))
      
      if (dbMediaError) throw dbMediaError
    }

    // 5. Update events to inactive status
    const { error: updateError } = await supabase
      .from('events')
      .update({ active: false })
      .in('id', eventIds)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      eventsArchived: expiredEvents.length,
      filesDeleted: deletedFiles
    })

  } catch (error: any) {
    console.error('Cleanup Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
