import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invite, plan, sessionId } = await request.json()

    // 1. Setup Admin Client to bypass RLS for inserting plans and verifying invites
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // 2. Handling VIP Invites
    if (invite) {
      // Validate invite against the 'invites' table
      const { data: inviteRecord, error: inviteError } = await supabaseAdmin
        .from('invites')
        .select('*')
        .eq('code', invite)
        .eq('is_used', false)
        .single()

      // Fallback for hardcoded legacy vip code (if you want to keep it temporarily, but limited)
      const isLegacyVip = invite === 'memvor-vip-2026'

      if (inviteError && !isLegacyVip) {
        return NextResponse.json({ error: 'Convite inválido ou já utilizado' }, { status: 400 })
      }

      if (isLegacyVip) {
        // Checar limite global do cupom legacy (ex: max 100 usos globais)
        const { count } = await supabaseAdmin
          .from('user_plans')
          .select('*', { count: 'exact', head: true })
          .eq('payment_id', `invite-memvor-vip-2026`)
          
        if (count && count >= 100) {
          return NextResponse.json({ error: 'Este cupom global esgotou o limite de usos.' }, { status: 400 })
        }
        
        // Checar se este usuario já usou
        const { data: alreadyUsed } = await supabaseAdmin
          .from('user_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('payment_id', `invite-memvor-vip-2026`)
          .maybeSingle()
          
        if (alreadyUsed) {
          return NextResponse.json({ error: 'Você já utilizou este cupom.' }, { status: 400 })
        }
      }

      const planToSave = inviteRecord ? inviteRecord.plan_id : 'classic'
      const paymentRef = inviteRecord ? `invite-${invite}` : `invite-memvor-vip-2026`

      // Atribuir o plano
      const { error: planError } = await supabaseAdmin.from('user_plans').insert({
        user_id: user.id,
        plan_id: planToSave,
        payment_id: paymentRef,
      })

      if (planError) throw planError

      // Marcar convite como usado (se não for o genérico)
      if (inviteRecord) {
        await supabaseAdmin
          .from('invites')
          .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
          .eq('code', invite)
      }

      return NextResponse.json({ success: true, plan: planToSave })
    }

    // 3. Handling old Stripe sessionId (Se ainda houver integração ativa no futuro)
    if (sessionId) {
      // Aqui você idealmente chamaria a API do Stripe: stripe.checkout.sessions.retrieve(sessionId)
      // Para garantir que a sessão é real e paga.
      // Como não estamos integrando o SDK do stripe aqui, vamos apenas rejeitar requisições cegas
      // se não houver uma verificação robusta.
      return NextResponse.json({ error: 'O resgate de sessões direto no cadastro foi desativado por segurança. Acesse pelo Webhook.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Nenhum convite fornecido.' }, { status: 400 })

  } catch (error: any) {
    console.error('Register Plan Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
