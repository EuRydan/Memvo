import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // Disable caching on the edge
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('CDN-Cache-Control', 'no-store')
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store')

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
