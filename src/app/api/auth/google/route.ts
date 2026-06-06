import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  const origin = new URL(request.url).origin

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/api/auth/google/callback`
  )

  const scopes = [
    'https://www.googleapis.com/auth/drive.file'
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent screen to always get a refresh token
    scope: scopes,
    state: eventId || 'general' // Pass eventId in state to know which event to link
  })

  return NextResponse.redirect(url)
}
