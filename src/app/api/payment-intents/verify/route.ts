import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const { intentId, paymentId } = await request.json()

    if (!intentId && !paymentId) {
      return NextResponse.json({ error: 'Missing intentId and paymentId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar a intent
    let intent: any = null
    
    if (intentId) {
      const { data, error: intentError } = await supabaseAdmin
        .from('payment_intents')
        .select('*')
        .eq('id', intentId)
        .maybeSingle()
      
      if (data) intent = data
    }

    if (intent?.status === 'approved') {
      return NextResponse.json({ success: true, status: 'approved' })
    }

    // Se estiver pendente, vamos checar no Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    let approvedPayment: any = null
    let currentIntentId = intentId

    if (paymentId) {
      try {
        const payment = await paymentClient.get({ id: paymentId })
        if (payment.status === 'approved') {
          approvedPayment = payment
          if (!currentIntentId) currentIntentId = payment.external_reference
        }
      } catch (err) {
        console.error('Error fetching payment by id', err)
      }
    }

    if (!approvedPayment && currentIntentId) {
      const searchResult = await paymentClient.search({
        options: {
          external_reference: currentIntentId
        }
      })
      approvedPayment = searchResult.results?.find((p: any) => p.status === 'approved')
    }

    if (!approvedPayment) {
      return NextResponse.json({ success: true, status: 'pending' })
    }

    // Se intentId não veio originalmente, precisamos buscar a intent agora
    if (!intent) {
      const { data: newIntent, error: newIntentError } = await supabaseAdmin
        .from('payment_intents')
        .select('*')
        .eq('id', currentIntentId)
        .maybeSingle()
        
      if (newIntent) intent = newIntent
      else return NextResponse.json({ error: 'Intent not found from MP reference' }, { status: 404 })
    }

    const mpPaymentId = approvedPayment.id
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
      .eq('payment_id', mpPaymentId?.toString() || '')
      .maybeSingle()

    if (!existingPlan) {
      // 1. Atualizar Intent
      await supabaseAdmin
        .from('payment_intents')
        .update({ status: 'approved', processed_at: new Date().toISOString(), mp_payment_id: mpPaymentId?.toString() })
        .eq('id', currentIntentId)

      // 2. Inserir Plano
      await supabaseAdmin
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_id: planId,
          payment_id: mpPaymentId?.toString() || 'manual_verification'
        })

      // 3. Ativar Evento
      await supabaseAdmin
        .from('events')
        .update({ active: true, status: 'published' })
        .eq('id', eventId)
        
      console.log(`Verificação manual: Plano ${planId} e evento ${eventId} ativados com sucesso para ${userId}`)

      // 4. Process Affiliate Commission
      const { data: intentData } = await supabaseAdmin
        .from('payment_intents')
        .select('affiliate_code')
        .eq('id', currentIntentId)
        .single()
        
      const affiliateCode = intentData?.affiliate_code

      if (affiliateCode) {
        // Find affiliate by code
        const { data: affiliate } = await supabaseAdmin
          .from('affiliates')
          .select('id, user_id, commission_rate, status')
          .eq('affiliate_code', affiliateCode)
          .maybeSingle()

        // Ensure affiliate is approved and the buyer is not the affiliate themselves
        if (affiliate && affiliate.status === 'approved' && affiliate.user_id !== userId) {
          const commissionAmount = paidAmount * Number(affiliate.commission_rate)
          
          await supabaseAdmin
            .from('affiliate_commissions')
            .insert({
              affiliate_id: affiliate.id,
              payment_intent_id: currentIntentId,
              amount: commissionAmount,
              status: 'pending'
            })
            // Ignore conflicts (e.g. if webhook already created it due to race condition)
            .select()
            .single()
            .then(({ error }) => {
              if (error && error.code !== '23505') { // 23505 = unique_violation
                console.error('Error creating commission in verify:', error)
              }
            })
        }
      }
    }

    return NextResponse.json({ success: true, status: 'approved' })

  } catch (error: any) {
    console.error('Erro na verificação manual do pagamento:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
