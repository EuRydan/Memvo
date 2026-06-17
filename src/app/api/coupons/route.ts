import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: affiliate, error } = await supabase
    .from('affiliates')
    .select('name, affiliate_code, status')
    .eq('affiliate_code', code)
    .maybeSingle()

  if (error || !affiliate || affiliate.status !== 'approved') {
    return NextResponse.json({ valid: false, error: 'Cupom inválido ou inativo.' }, { status: 200 })
  }

  return NextResponse.json({ 
    valid: true, 
    partnerName: affiliate.name,
    code: affiliate.affiliate_code 
  })
}
