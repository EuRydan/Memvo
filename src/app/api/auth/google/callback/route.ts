import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const eventId = searchParams.get('state') // we passed eventId in the state parameter

  const origin = new URL(request.url).origin

  if (!code || !eventId || eventId === 'general') {
    return NextResponse.redirect(`${origin}/dashboard?error=MissingCodeOrEventId`)
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${origin}/api/auth/google/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    
    // tokens.refresh_token is what we need to store
    if (tokens.refresh_token) {
      // Connect to Supabase using service role to bypass RLS if needed, or anon key if RLS allows update
      // We will use service_role key to be safe, but since this is an API route, let's use it directly
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error } = await supabase
        .from('events')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('id', eventId)

      if (error) {
        console.error('Error saving refresh token:', error)
        return NextResponse.redirect(`${origin}/dashboard/${eventId}?error=DatabaseUpdateFailed`)
      }
    }

    return NextResponse.redirect(`${origin}/dashboard/${eventId}?success=DriveConnected`)
  } catch (error) {
    console.error('Error during Google OAuth callback:', error)
    return NextResponse.redirect(`${origin}/dashboard/${eventId}?error=OAuthFailed`)
  }
}
