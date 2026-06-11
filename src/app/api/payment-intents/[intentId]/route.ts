import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: Promise<{ intentId: string }> }) {
  try {
    const { intentId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: intent, error } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .eq('user_id', user.id) // Ensure the user owns this intent
      .maybeSingle()

    if (error) throw error
    if (!intent) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 })
    }

    return NextResponse.json({ intent })
  } catch (error: any) {
    console.error('Fetch payment intent error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
