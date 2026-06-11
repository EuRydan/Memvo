import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const { intentId } = await request.json()

    if (!intentId) {
      return NextResponse.json({ error: 'Missing intentId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar a intent
    const { data: intent, error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .maybeSingle()

    if (intentError || !intent) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 })
    }

    if (intent.status === 'approved') {
      return NextResponse.json({ success: true, status: 'approved' })
    }

    // Se estiver pendente, vamos checar no Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    // Procurar pagamentos com este external_reference
    const searchResult = await paymentClient.search({
      options: {
        external_reference: intentId
      }
    })

    const approvedPayment = searchResult.results?.find((p: any) => p.status === 'approved')

    if (!approvedPayment) {
      return NextResponse.json({ success: true, status: 'pending' })
    }

    const paymentId = approvedPayment.id
    const paidAmount = approvedPayment.transaction_amount

    // Validar valor
    if (paidAmount !== Number(intent.amount)) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    const planId = intent.plan_id
    const userId = intent.user_id
    const eventId = intent.event_id

    // Verificar se já ativou
    const { data: existingPlan } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('payment_id', paymentId?.toString() || '')
      .maybeSingle()

    if (!existingPlan) {
      // 1. Atualizar Intent
      await supabaseAdmin
        .from('payment_intents')
        .update({ status: 'approved', processed_at: new Date().toISOString(), mp_payment_id: paymentId?.toString() })
        .eq('id', intentId)

      // 2. Inserir Plano
      await supabaseAdmin
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_id: planId,
          payment_id: paymentId?.toString() || 'manual_verification'
        })

      // 3. Ativar Evento
      await supabaseAdmin
        .from('events')
        .update({ active: true, status: 'published' })
        .eq('id', eventId)
        
      console.log(`Verificação manual: Plano ${planId} e evento ${eventId} ativados com sucesso para ${userId}`)
    }

    return NextResponse.json({ success: true, status: 'approved' })

  } catch (error: any) {
    console.error('Erro na verificação manual do pagamento:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
