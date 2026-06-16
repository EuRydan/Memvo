import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import crypto from 'crypto'
import { normalizePaymentMethod, calculateAffiliateCommission } from '@/lib/webhook-utils'

export async function POST(request: Request) {
  console.log(`[WEBHOOK RECEBIDO] Chamada recebida na rota /api/webhooks/mercadopago - URL: ${request.url}`)
  try {
    const url = new URL(request.url)
    const topicParam = url.searchParams.get('topic')
    const dataIdParam = url.searchParams.get('data.id')

    if (topicParam && !dataIdParam) {
      console.log(`[WEBHOOK] Notificação legada (Feed/topic) recebida e ignorada - payment_id já processado via Webhook v2`)
      return NextResponse.json({ received: true })
    }

    const signatureHeader = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    const enforceSignature = process.env.WEBHOOK_ENFORCE_SIGNATURE === 'true'
    
    // We clone the request to read json if needed without consuming it if we had raw body needs,
    // but MP's signature only uses id, request-id and ts.
    const payload = await request.json()
    const { action, type, data } = payload
    
    // O ID pode vir no body ou na URL dependendo do tipo de notificação (IPN vs Webhook)
    let paymentId = data?.id
    if (!paymentId) {
      const url = new URL(request.url)
      paymentId = url.searchParams.get('data.id') || url.searchParams.get('id')
    }

    // -- SHADOW MODE / VALIDAÇÃO DE ASSINATURA --
    if (signatureHeader && requestId && secret && paymentId) {
      try {
        const parts = signatureHeader.split(',')
        let ts = ''
        let v1 = ''
        parts.forEach(part => {
          if (part.startsWith('ts=')) ts = part.split('=')[1]
          if (part.startsWith('v1=')) v1 = part.split('=')[1]
        })

        if (ts && v1) {
          const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
          const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
          
          if (hmac !== v1) {
            console.error(`[ALERTA WEBHOOK] Assinatura do Mercado Pago inválida!`)
            console.error(`Recebido v1 completo: ${v1}`)
            console.error(`Calculado hmac completo: ${hmac}`)
            console.error(`Manifesto usado exato: '${manifest}'`)
            console.error(`Debug info: paymentId='${paymentId}' (tipo: ${typeof paymentId}), requestId='${requestId}', ts='${ts}'`)
            
            if (enforceSignature) {
              return NextResponse.json({ error: 'Unauthorized', message: 'Invalid signature' }, { status: 401 })
            }
          }
        }
      } catch (err) {
        console.error('Erro ao validar assinatura:', err)
      }
    } else if (enforceSignature && secret) {
       console.error('[ALERTA WEBHOOK] Headers de assinatura ausentes mas modo ENFORCE está ativo.')
       return NextResponse.json({ error: 'Unauthorized', message: 'Missing headers' }, { status: 401 })
    }
    // -- FIM DA VALIDAÇÃO --

    if (action === 'payment.created' || action === 'payment.updated' || type === 'payment') {

      if (!paymentId) {
        return NextResponse.json({ success: true, message: 'Ignored: No payment id' })
      }

      // Buscar os detalhes do pagamento no Mercado Pago
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
      const client = new MercadoPagoConfig({ accessToken })
      const paymentClient = new Payment(client)

      let paymentInfo;
      try {
        paymentInfo = await paymentClient.get({ id: paymentId })
      } catch (err: any) {
        if (err.message?.includes('Payment not found') || err.status === 404 || paymentId === '123456' || paymentId === 123456) {
          console.log(`[WEBHOOK TESTE] Pagamento ${paymentId} não encontrado. Assumindo como teste do Mercado Pago.`);
          return NextResponse.json({ success: true, message: 'Test webhook ignored' });
        }
        throw err;
      }

      if (paymentInfo.status === 'approved') {
        const externalReference = paymentInfo.external_reference
        const paymentMethodNormalized = normalizePaymentMethod(paymentInfo.payment_method_id, paymentInfo.payment_type_id)

        console.log(`✅ [WEBHOOK SUCESSO] Pagamento aprovado via: ${paymentMethodNormalized.toUpperCase()} (ID: ${paymentId})`)
        
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
            .update({ 
              status: 'approved', 
              processed_at: new Date().toISOString(), 
              mp_payment_id: paymentId.toString(),
              payment_method: paymentMethodNormalized
            })
            .eq('id', intentId)

          // 2. Inserir novo registro de plano vinculado ao evento (histórico por evento)
          // Nunca sobrescrever: cada pagamento gera um novo registro com event_id
          const { error: planError } = await supabaseAdmin
            .from('user_plans')
            .insert({
              user_id: userId,
              plan_id: planId,
              payment_id: paymentId.toString(),
              event_id: eventId
            })

          if (planError) {
            console.error('Erro ao inserir plano no Supabase:', planError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
          }

          // 3. Ativar Evento
          const { error: eventUpdateError } = await supabaseAdmin
            .from('events')
            .update({ active: true, status: 'published' }) // ou 'active' se o status for outro
            .eq('id', eventId)
            
          if (eventUpdateError) {
            console.error('Erro crítico ao atualizar status do evento no Webhook:', eventUpdateError)
          }
            
          console.log(`Plano ${planId} e evento ${eventId} ativados com sucesso via Webhook MercadoPago para o usuário ${userId}`)

          // 4. Process Affiliate Commission
          const { data: intentData } = await supabaseAdmin
            .from('payment_intents')
            .select('affiliate_code')
            .eq('id', intentId)
            .single()
            
          const affiliateCode = intentData?.affiliate_code

          if (affiliateCode) {
            // Find affiliate by code
            const { data: affiliate } = await supabaseAdmin
              .from('affiliates')
              .select('id, user_id, commission_rate, status')
              .eq('affiliate_code', affiliateCode)
              .maybeSingle()

            if (!affiliate) {
              console.warn(`[COMISSÃO] Aviso: Afiliado com código ${affiliateCode} não encontrado. Nenhuma comissão gerada.`)
            } else {
              const commissionResult = calculateAffiliateCommission(
                paidAmount,
                affiliate.commission_rate,
                affiliate.user_id,
                userId, // buyerUserId (the one making the payment)
                affiliate.status
              )

              if (!commissionResult.isValid) {
                console.warn(`[COMISSÃO] Aviso: ${commissionResult.reason} para afiliado ${affiliateCode}. Nenhuma comissão gerada.`)
              } else {
                const commissionAmount = commissionResult.amount
                
                await supabaseAdmin
                  .from('affiliate_commissions')
                .insert({
                  affiliate_id: affiliate.id,
                  payment_intent_id: intentId,
                  amount: commissionAmount,
                  status: 'pending'
                })
                .select()
                .single()
                .then(({ error }) => {
                  if (error) {
                    if (error.code === '23505') { // unique_violation
                      console.log(`[COMISSÃO] Afiliado ${affiliateCode} — Comissão de R$ ${commissionAmount.toFixed(2)} já havia sido registrada (idempotência) para payment_intent ${intentId}`)
                    } else {
                      console.error(`[COMISSÃO] Erro ao criar comissão para ${affiliateCode}:`, error)
                    }
                  } else {
                    console.log(`[COMISSÃO] Afiliado ${affiliateCode} — R$ ${commissionAmount.toFixed(2)} registrado para payment_intent ${intentId}`)
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
