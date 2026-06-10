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

        const [userId, planIdRaw] = externalReference.split('|')
        
        if (!userId || !planIdRaw) {
          console.error(`externalReference mal formatado: ${externalReference}`)
          return NextResponse.json({ error: 'Invalid external reference' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        if (planIdRaw.startsWith('b2b_')) {
          // Geração de Vouchers para parceiros
          const pack = planIdRaw.replace('b2b_', '')
          const PACKAGES: Record<string, { count: number, plan: string }> = {
            pack_5: { count: 5, plan: 'classic' },
            pack_10: { count: 10, plan: 'classic' },
            pack_20: { count: 20, plan: 'classic' }
          }
          const packData = PACKAGES[pack]

          if (packData) {
            // Verifica se já gerou vouchers para este pagamento
            const { data: existingVouchers } = await supabaseAdmin
              .from('vouchers')
              .select('id')
              .eq('payment_id', paymentId.toString())
              .limit(1)

            if (!existingVouchers || existingVouchers.length === 0) {
              const { generateVoucherCode } = await import('@/lib/voucher-generator')
              const newVouchers = []
              
              for (let i = 0; i < packData.count; i++) {
                let isUnique = false
                let newCode = ''
                let attempts = 0
                
                while (!isUnique && attempts < 10) {
                  newCode = generateVoucherCode()
                  const { data } = await supabaseAdmin.from('vouchers').select('id').eq('code', newCode).maybeSingle()
                  if (!data) isUnique = true
                  attempts++
                }

                newVouchers.push({
                  code: newCode,
                  purchaser_id: userId,
                  plan_type: packData.plan,
                  status: 'available',
                  payment_id: paymentId.toString() // para evitar duplicidade futuramente
                })
              }

              const { error: insertError } = await supabaseAdmin.from('vouchers').insert(newVouchers)
              if (insertError) {
                console.error('Erro ao inserir vouchers no webhook:', insertError)
              } else {
                console.log(`Gerado ${packData.count} vouchers para o parceiro ${userId}`)
              }
            }
          }
        } else {
          const planId = planIdRaw

          // Verificar se já ativou
          const { data: existingPlan } = await supabaseAdmin
            .from('user_plans')
            .select('*')
            .eq('payment_id', paymentId)
            .maybeSingle()

          if (!existingPlan) {
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
            console.log(`Plano ${planId} ativado com sucesso via Webhook MercadoPago para o usuário ${userId}`)
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
