import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const asaasToken = process.env.ASAAS_WEBHOOK_TOKEN
    
    if (asaasToken) {
      const headerToken = request.headers.get('asaas-access-token')
      if (headerToken !== asaasToken) {
        console.warn('Webhook Asaas recebido com token inválido')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload = await request.json()
    const { event, payment } = payload

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const externalReference = payment?.externalReference
      
      if (!externalReference) {
        console.warn(`Pagamento Asaas recebido sem externalReference: ${payment?.id}`)
        return NextResponse.json({ success: true, message: 'Ignored: No external reference' })
      }

      const [userId, planId] = externalReference.split('|')

      if (!userId || !planId) {
        console.error(`externalReference mal formatado: ${externalReference}`)
        return NextResponse.json({ error: 'Invalid external reference' }, { status: 400 })
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      const { error: insertError } = await supabaseAdmin
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_id: planId,
          payment_id: payment.id
        })

      if (insertError) {
        console.error('Erro ao ativar plano no Supabase:', insertError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log(`Plano ${planId} ativado com sucesso via Webhook Asaas para o usuário ${userId}`)
      return NextResponse.json({ success: true, message: 'Plan activated' })
    }

    return NextResponse.json({ success: true, message: 'Event ignored' })

  } catch (error: any) {
    console.error('Erro no Webhook Asaas:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
