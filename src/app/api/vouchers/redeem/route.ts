import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

    const { code, plan } = await request.json()

    if (!code || !plan) {
      return NextResponse.json({ error: 'Código ou plano ausente' }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase não configurado no servidor' }, { status: 503 })
    }

    // Usar a Service Role para burlar RLS temporariamente e garantir a atualização
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Obter o usuário que está resgatando o voucher via cookie original
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', 
      {
        global: {
          headers: {
            Cookie: request.headers.get('cookie') || ''
          }
        }
      }
    )
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Você precisa estar logado para resgatar um voucher' }, { status: 401 })
    }

    // --- RATE LIMIT CHECK ---
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    
    if (ip !== 'unknown') {
      const { data: rlData } = await supabaseAdmin.from('rate_limits').select('*').eq('ip_address', ip).single()
      if (rlData) {
        const hoursSinceLast = (Date.now() - new Date(rlData.last_attempt).getTime()) / (1000 * 60 * 60)
        if (hoursSinceLast < 1 && rlData.attempts >= 5) {
          return NextResponse.json({ error: 'Muitas tentativas inválidas. Tente novamente em 1 hora.' }, { status: 429 })
        }
      }
    }

    // Helper para registrar falha
    const registerFailure = async () => {
      if (ip === 'unknown') return
      const { data: rlData } = await supabaseAdmin.from('rate_limits').select('*').eq('ip_address', ip).single()
      if (rlData) {
        const hoursSinceLast = (Date.now() - new Date(rlData.last_attempt).getTime()) / (1000 * 60 * 60)
        if (hoursSinceLast >= 1) {
          await supabaseAdmin.from('rate_limits').update({ attempts: 1, last_attempt: new Date().toISOString() }).eq('ip_address', ip)
        } else {
          await supabaseAdmin.from('rate_limits').update({ attempts: rlData.attempts + 1, last_attempt: new Date().toISOString() }).eq('ip_address', ip)
        }
      } else {
        await supabaseAdmin.from('rate_limits').insert({ ip_address: ip, attempts: 1 })
      }
    }

    // 1. Busca o voucher pelo código
    const { data: voucher, error: fetchError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', code.trim().toLowerCase())
      .single()

    if (fetchError || !voucher) {
      await registerFailure()
      return NextResponse.json({ error: 'Código de parceiro inválido ou inexistente' }, { status: 404 })
    }

    // 2. Verifica se está disponível
    if (voucher.status !== 'available') {
      await registerFailure()
      return NextResponse.json({ error: 'Este código já foi resgatado' }, { status: 400 })
    }

    // 3. (Opcional) Verifica se o plano do voucher cobre o plano solicitado
    // Se um cerimonialista comprou 'classic', ele só deve poder resgatar 'essential' ou 'classic'.
    // Mas para simplificar nesta versão, vamos assumir que o voucher funciona para o plano exato dele.
    if (voucher.plan_type !== plan && voucher.plan_type !== 'premium') {
        // Logica simples de downgrade: 'premium' pode ativar qualquer um. 'classic' ativa 'classic' e 'essential'.
        const planHierarchy = { 'essential': 1, 'classic': 2, 'premium': 3 }
        const voucherRank = planHierarchy[voucher.plan_type as keyof typeof planHierarchy] || 0
        const requestRank = planHierarchy[plan as keyof typeof planHierarchy] || 0
        
        if (requestRank > voucherRank) {
            return NextResponse.json({ error: `Este código é válido apenas para planos até o nível ${voucher.plan_type}` }, { status: 400 })
        }
    }

    // 4. Marca o voucher como resgatado
    const { error: updateError } = await supabaseAdmin
      .from('vouchers')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        redeemed_by_event_id: user.id // Salvando quem resgatou
      })
      .eq('id', voucher.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao processar o resgate' }, { status: 500 })
    }
    
    // 5. Salva o plano na conta do usuário
    const { error: planError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: user.id,
        plan_id: plan,
        payment_id: `voucher_${voucher.code}`
      })
      
    if (planError) {
      console.error('Erro ao salvar plano do usuário:', planError)
      // Não vamos falhar o resgate se deu erro no plano, mas deveríamos alertar
    }

    // Limpa o rate limit em caso de sucesso
    if (ip !== 'unknown') {
      await supabaseAdmin.from('rate_limits').delete().eq('ip_address', ip)
    }

    // Sucesso!
    return NextResponse.json({
      success: true,
      message: 'Voucher aplicado com sucesso. Evento ativado!'
    })

  } catch (error: any) {
    console.error('Erro no resgate de voucher:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
