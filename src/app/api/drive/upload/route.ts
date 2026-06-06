import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const uploadSchema = z.object({
  eventId: z.string().uuid(),
  storagePath: z.string().min(5).max(500),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = uploadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input data', details: parsed.error.format() }, { status: 400 })
    }

    const { eventId, storagePath } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name, google_refresh_token, google_folder_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event || !event.google_refresh_token) {
      // No token means host hasn't connected Google Drive, which is fine
      return NextResponse.json({ skipped: true, reason: 'No Google Drive connected' }, { status: 200 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({ refresh_token: event.google_refresh_token })
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    let folderId = event.google_folder_id

    // Create folder if it doesn't exist
    if (!folderId) {
      const folderName = `Memvor - ${event.name}`
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      })
      folderId = folder.data.id

      // Save folderId to event
      if (folderId) {
        await supabase
          .from('events')
          .update({ google_folder_id: folderId })
          .eq('id', eventId)
      }
    }

    // Download image from Supabase
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`
    const imageRes = await fetch(imageUrl)
    
    if (!imageRes.ok || !imageRes.body) {
      return NextResponse.json({ error: 'Failed to fetch image from Supabase' }, { status: 500 })
    }

    const fileName = storagePath.split('/').pop() || 'photo.jpg'

    // Use PassThrough or buffer
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Convert Buffer to Readable Stream for googleapis
    const stream = require('stream')
    const bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)

    // Upload to Google Drive
    const fileMetadata = {
      name: fileName,
      parents: [folderId!],
    }
    const media = {
      mimeType: imageRes.headers.get('content-type') || 'image/jpeg',
      body: bufferStream,
    }

    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Drive Upload Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
