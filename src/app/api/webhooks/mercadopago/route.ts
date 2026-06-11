import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature')
    // TODO: Validar assinatura se MERCADOPAGO_WEBHOOK_SECRET estiver configurado
    
    const payload = await request.json()
    const { action, type, data } = payload

    if (action === 'payment.created' || action === 'payment.updated' || type === 'payment') {
      const paymentId = data?.id

      if (!paymentId) {
        return NextResponse.json({ success: true, message: 'Ignored: No payment id' })
      }

      // Buscar os detalhes do pagamento no Mercado Pago
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
      const client = new MercadoPagoConfig({ accessToken })
      const paymentClient = new Payment(client)

      const paymentInfo = await paymentClient.get({ id: paymentId })

      if (paymentInfo.status === 'approved') {
        const externalReference = paymentInfo.external_reference
        
        if (!externalReference) {
          console.warn(`Pagamento recebido sem externalReference: ${paymentId}`)
          return NextResponse.json({ success: true, message: 'Ignored: No external reference' })
        }

        const intentId = externalReference
        
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
          console.error(`Intent não encontrada: ${intentId}`)
          return NextResponse.json({ error: 'Intent not found' }, { status: 404 })
        }

        // Validar valor da transação
        const paidAmount = paymentInfo.transaction_amount
        if (paidAmount !== Number(intent.amount)) {
          console.error(`Valor pago (${paidAmount}) diverge do intent (${intent.amount}) para intent ${intentId}`)
          // Em um cenário real poderíamos marcar como "partial_payment", mas para este B2C vamos rejeitar a ativação automática
          return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
        }

        const planId = intent.plan_id
        const userId = intent.user_id
        const eventId = intent.event_id

        // Verificar se já ativou
        const { data: existingPlan } = await supabaseAdmin
          .from('user_plans')
          .select('*')
          .eq('payment_id', paymentId.toString())
          .maybeSingle()

        if (!existingPlan) {
          // Iniciar transação/atualizações
          // 1. Atualizar Intent
          await supabaseAdmin
            .from('payment_intents')
            .update({ status: 'approved', processed_at: new Date().toISOString(), mp_payment_id: paymentId.toString() })
            .eq('id', intentId)

          // 2. Inserir Plano
          const { error: insertError } = await supabaseAdmin
            .from('user_plans')
            .insert({
              user_id: userId,
              plan_id: planId,
              payment_id: paymentId.toString()
            })

          if (insertError) {
            console.error('Erro ao ativar plano no Supabase:', insertError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
          }

          // 3. Ativar Evento
          await supabaseAdmin
            .from('events')
            .update({ active: true, status: 'published' }) // ou 'active' se o status for outro
            .eq('id', eventId)
            
          console.log(`Plano ${planId} e evento ${eventId} ativados com sucesso via Webhook MercadoPago para o usuário ${userId}`)

          // 4. Process Affiliate Commission
          const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
          const affiliateCode = user?.user?.user_metadata?.affiliate_code

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
                  payment_intent_id: intentId,
                  amount: commissionAmount,
                  status: 'pending'
                })
                // Ignore conflicts (e.g. if verify already created it due to race condition)
                .select()
                .single()
                .then(({ error }) => {
                  if (error && error.code !== '23505') { // 23505 = unique_violation
                    console.error('Error creating commission in webhook:', error)
                  }
                })
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Processed successfully' })
      }
    }

    return NextResponse.json({ success: true, message: 'Event ignored' })

  } catch (error: any) {
    console.error('Erro no Webhook Mercado Pago:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
