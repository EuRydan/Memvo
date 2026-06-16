import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const supabase = await createClient()

  // Find affiliate by code
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, status, affiliate_code')
    .ilike('affiliate_code', code.trim())
    .maybeSingle()

  const response = NextResponse.redirect(new URL('/', request.url))

  // Only track if the affiliate exists and is approved
  if (affiliate && affiliate.status === 'approved') {
    // Set cookie for 30 days
    response.cookies.set({
      name: 'affiliate_code',
      value: affiliate.affiliate_code,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}
