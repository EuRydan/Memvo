import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const PLAN_NAMES = {
  freemium: 'Plano Free',
  essential: 'Plano Essencial',
  classic: 'Plano Clássico',
  premium: 'Plano Premium'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { intentId, couponCode } = await request.json()

    if (!intentId || !couponCode) {
      return NextResponse.json({ error: 'Missing intentId or couponCode' }, { status: 400 })
    }

    // 1. Validar o Cupom
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('user_id, affiliate_code, status, name')
      .ilike('affiliate_code', couponCode.trim())
      .maybeSingle()

    if (!affiliate || affiliate.status !== 'approved') {
      return NextResponse.json({ error: 'Cupom inválido ou inativo.' }, { status: 404 })
    }

    if (affiliate.user_id === user.id) {
      return NextResponse.json({ error: 'Você não pode usar seu próprio código de afiliado.' }, { status: 400 })
    }

    // 2. Buscar a intent atual
    const { data: intent } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .eq('user_id', user.id)
      .single()

    if (!intent) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 })
    }

    if (intent.affiliate_code) {
      return NextResponse.json({ error: 'Um cupom já foi aplicado a esta compra.' }, { status: 400 })
    }

    // 3. Calcular novo valor (10% desconto)
    const newAmount = Number(intent.amount) * 0.90

    // 4. Atualizar Intent no DB
    await supabase
      .from('payment_intents')
      .update({
        amount: newAmount,
        affiliate_code: affiliate.affiliate_code
      })
      .eq('id', intentId)

    return NextResponse.json({
      success: true,
      newAmount,
      partnerName: affiliate.name
    })

  } catch (error: any) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Erro interno ao aplicar cupom' }, { status: 500 })
  }
}
