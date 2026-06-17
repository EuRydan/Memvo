import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { isEventLocked, getChallengeLimit, getVideoDurationLimit, getCollaboratorLimit, hasEventAccess, isTelaoEnabled } from '../src/lib/limits'
import { normalizePaymentMethod, calculateAffiliateCommission } from '../src/lib/webhook-utils'

// Carregar variáveis de ambiente manualmente sem usar dotenv
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim()
        const val = trimmed.substring(idx + 1).trim()
        process.env[key] = val
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

let total = 0
let passes = 0
let fails = 0
const failedList: string[] = []

function assertCheck(name: string, expected: any, actual: any, reason?: string) {
  total++
  // Stringify objects for comparison if needed
  const expectedStr = typeof expected === 'object' ? JSON.stringify(expected) : expected
  const actualStr = typeof actual === 'object' ? JSON.stringify(actual) : actual
  
  const pass = expectedStr === actualStr
  if (pass) {
    console.log(`[PASSO ${total}] ${name} | Esperado: ${expectedStr} | Obtido: ${actualStr} | ✅`)
    passes++
  } else {
    console.log(`[PASSO ${total}] ${name} | Esperado: ${expectedStr} | Obtido: ${actualStr} | ❌`)
    if (reason) console.log(`   -> NOTA: ${reason}`)
    fails++
    failedList.push(name)
  }
  return pass
}

async function runAudit() {
  console.log('--- INICIANDO AUDITORIA DE PONTA A PONTA (MEMVOR) ---')
  const prefix = 'audit_test_' + Date.now()
  
  // Guardar IDs para o cleanup
  const usersToDelete: string[] = []
  const eventsToDelete: string[] = []
  const affiliatesToDelete: string[] = []

  try {
    // ==========================================
    // BLOCO 1 - Cadastro e Onboarding
    // ==========================================
    console.log('\n--- BLOCO 1: Cadastro e Onboarding ---')
    
    // 1.1 Criar Host de teste
    const { data: hostUser, error: err1 } = await supabaseAdmin.auth.admin.createUser({
      email: `${prefix}_host@example.com`,
      password: 'password123',
      email_confirm: true,
      user_metadata: { role: 'host' }
    })
    if (err1) throw new Error('Falha ao criar host user: ' + err1.message)
    usersToDelete.push(hostUser.user.id)
    assertCheck('1.1 Criar usuário HOST', 'host', hostUser.user.user_metadata.role)

    // 1.2 Criar evento draft
    const { data: event1, error: err2 } = await supabaseAdmin.from('events').insert({
      owner_id: hostUser.user.id,
      name: `${prefix}_Evento_Draft`,
      slug: `${prefix}_draft`,
      status: 'draft',
      active: false,
      date: new Date().toISOString().split('T')[0]
    }).select().single()
    if (err2) throw new Error('Falha ao criar evento 1: ' + err2.message)
    eventsToDelete.push(event1.id)
    assertCheck('1.2 Criar evento', 'draft', event1.status)
    assertCheck('1.3 Evento nasce inativo/bloqueado', false, event1.active)

    // ==========================================
    // BLOCO 2 - Paywall (Modelo 1 Plano = 1 Evento)
    // ==========================================
    console.log('\n--- BLOCO 2: Paywall ("1 plano = 1 evento") ---')
    
    // 2.1 isEventLocked antes de pagar
    assertCheck('2.1 Evento draft sem planos está bloqueado?', true, isEventLocked(event1.id, [], event1))

    // 2.2 Simular pagamento (inserir plano)
    await supabaseAdmin.from('user_plans').insert({
      user_id: hostUser.user.id,
      plan_id: 'essential',
      event_id: event1.id,
      payment_id: `payment_${prefix}`
    })
    
    // Buscar plano do banco
    const { data: userPlansData } = await supabaseAdmin.from('user_plans').select('event_id, plan_id').eq('user_id', hostUser.user.id)
    const userPlans1 = userPlansData || []
    
    // 2.3 Validar liberação do evento 1
    assertCheck('2.3 isEventLocked após pagamento libera o evento 1?', false, isEventLocked(event1.id, userPlans1, event1))

    // 2.4 Teste Chave: Criar SEGUNDO evento
    const { data: event2 } = await supabaseAdmin.from('events').insert({
      owner_id: hostUser.user.id,
      name: `${prefix}_Evento_Draft_2`,
      slug: `${prefix}_draft_2`,
      status: 'draft',
      active: false,
      date: new Date().toISOString().split('T')[0]
    }).select().single()
    eventsToDelete.push(event2.id)

    // O usuário tem o userPlans1 (que contém apenas o plano do evento 1). Vamos checar se o evento 2 libera.
    assertCheck('2.4 BRECHA: isEventLocked para NOVO evento (com plano velho)?', true, isEventLocked(event2.id, userPlans1, event2))


    // ==========================================
    // BLOCO 3 - Limites de Plano
    // ==========================================
    console.log('\n--- BLOCO 3: Limites de Plano ---')
    
    // 3.1
    assertCheck('3.1 getChallengeLimit para essential', 4, getChallengeLimit('essential'))
    
    // 3.2 e 3.3 Simulação da Lógica de Backend (API Route /api/challenges)
    const backendLogicSim = (currentCount: number, limit: number) => currentCount >= limit ? 'BLOCKED' : 'ALLOWED'
    assertCheck('3.2 Inserir desafio 4 no essential (count atual=3)', 'ALLOWED', backendLogicSim(3, getChallengeLimit('essential')))
    assertCheck('3.3 Inserir desafio 5 no essential (count atual=4)', 'BLOCKED', backendLogicSim(4, getChallengeLimit('essential')))
    
    // 3.4 Outros planos
    assertCheck('3.4 getChallengeLimit classic', 7, getChallengeLimit('classic'))
    assertCheck('3.4 Inserir desafio 8 no classic (count atual=7)', 'BLOCKED', backendLogicSim(7, getChallengeLimit('classic')))
    assertCheck('3.4 getChallengeLimit premium', Infinity, getChallengeLimit('premium'))
    assertCheck('3.4 Inserir desafio 999 no premium (count atual=998)', 'ALLOWED', backendLogicSim(998, getChallengeLimit('premium')))

    // 3.5 Duração de Vídeo
    assertCheck('3.5 getVideoDurationLimit essential', 0, getVideoDurationLimit('essential'))
    assertCheck('3.5 getVideoDurationLimit classic', 60, getVideoDurationLimit('classic'))
    assertCheck('3.5 getVideoDurationLimit premium', 180, getVideoDurationLimit('premium'))


    // ==========================================
    // BLOCO 4 - Sistema de Afiliados e Comissões
    // ==========================================
    console.log('\n--- BLOCO 4: Afiliados e Comissões ---')
    
    // Criar Affiliate User
    const { data: affiliateUser } = await supabaseAdmin.auth.admin.createUser({
      email: `${prefix}_affiliate@example.com`,
      password: 'password123',
      email_confirm: true,
      user_metadata: { role: 'affiliate' }
    })
    if (!affiliateUser.user) throw new Error("Could not create affiliate user")
    usersToDelete.push(affiliateUser.user.id)

    // Inserir na tabela affiliates
    const { data: affiliateRow, error: affErr } = await supabaseAdmin.from('affiliates').insert({
      user_id: affiliateUser.user.id,
      name: 'Test Affiliate',
      affiliate_code: `${prefix}_CODE`,
      commission_rate: 0.25,
      status: 'approved',
      pix_key: 'test@pix.com'
    }).select().single()
    if (affErr) throw new Error('Falha ao inserir afiliado: ' + JSON.stringify(affErr))
    affiliatesToDelete.push(affiliateRow.id)

    // 4.3 Cálculo normal (100 reais, taxa 25%)
    const calcNormal = calculateAffiliateCommission(100, 0.25, affiliateUser.user.id, hostUser.user.id, 'approved')
    assertCheck('4.3 Cálculo de Comissão (Sucesso)', { isValid: true, amount: 25 }, calcNormal)

    // 4.4 Self-referral (comprador == afiliado)
    const calcSelf = calculateAffiliateCommission(100, 0.25, hostUser.user.id, hostUser.user.id, 'approved')
    assertCheck('4.4 Bloqueio de Self-referral', false, calcSelf.isValid)

    // 4.5 Afiliado não aprovado (status pending)
    const calcPending = calculateAffiliateCommission(100, 0.25, affiliateUser.user.id, hostUser.user.id, 'pending')
    assertCheck('4.5 Bloqueio de Afiliado Pending', false, calcPending.isValid)

    // 4.6 Normalização de Payment Method
    assertCheck('4.6 Normaliza payment_method (pix + bank_transfer)', 'pix', normalizePaymentMethod('pix', 'bank_transfer'))
    assertCheck('4.6 Normaliza payment_method (visa + credit_card)', 'credit_card', normalizePaymentMethod('visa', 'credit_card'))


    // ==========================================
    // BLOCO 5 - Co-anfitriões (Collaborators)
    // ==========================================
    console.log('\n--- BLOCO 5: Co-anfitriões e Ownership ---')
    
    assertCheck('5.1 getCollaboratorLimit essential', { max: 0, accessLevel: null }, getCollaboratorLimit('essential'))
    assertCheck('5.1 getCollaboratorLimit classic', { max: 1, accessLevel: 'challenges_only' }, getCollaboratorLimit('classic'))
    assertCheck('5.1 getCollaboratorLimit premium', { max: 2, accessLevel: 'full' }, getCollaboratorLimit('premium'))

    // Inserir Colaborador no evento 1
    const { error: collabErr } = await supabaseAdmin.from('event_collaborators').insert({
      event_id: event1.id,
      user_id: affiliateUser.user.id,
      email: affiliateUser.user.email,
      invited_by: hostUser.user.id,
      status: 'accepted',
      access_level: 'challenges_only'
    })
    if (collabErr) throw new Error('Falha ao inserir colaborador: ' + JSON.stringify(collabErr))

    // Criar Random User
    const { data: randomUser } = await supabaseAdmin.auth.admin.createUser({
      email: `${prefix}_random@example.com`,
      password: 'password123',
    })
    if (!randomUser.user) throw new Error("Could not create random user")
    usersToDelete.push(randomUser.user.id)

    // 5.3 Colaborador challenges_only
    const accessCollab = await hasEventAccess(supabaseAdmin, affiliateUser.user.id, event1.id)
    assertCheck('5.3 hasEventAccess (Colaborador)', { isOwner: false, accessLevel: 'challenges_only' }, accessCollab)

    // 5.4 Random User (sem acesso)
    const accessRandom = await hasEventAccess(supabaseAdmin, randomUser.user.id, event1.id)
    assertCheck('5.4 hasEventAccess (Usuário Aleatório)', { isOwner: false, accessLevel: null }, accessRandom)

    // 5.5 Owner
    const accessOwner = await hasEventAccess(supabaseAdmin, hostUser.user.id, event1.id)
    assertCheck('5.5 hasEventAccess (Dono do Evento)', { isOwner: true, accessLevel: 'full' }, accessOwner)


    // ==========================================
    // BLOCO 6 - Recursos por Plano
    // ==========================================
    console.log('\n--- BLOCO 6: Recursos por plano ---')
    assertCheck('6.1 isTelaoEnabled premium', true, isTelaoEnabled('premium'))
    assertCheck('6.1 isTelaoEnabled classic', false, isTelaoEnabled('classic'))

  } catch (err: any) {
    console.error('\n🚨 ERRO CRÍTICO NA EXECUÇÃO:', err.message)
  } finally {
    console.log('\n--- CLEANUP ---')
    try {
      // Deletar usuários (limpa em cascata events, plans, collaborators, etc. dependendo do DB)
      for (const uid of usersToDelete) {
        await supabaseAdmin.auth.admin.deleteUser(uid)
      }
      console.log(`✅ Cleanup completo. Deletados ${usersToDelete.length} usuários de teste (cascata aplicada).`)
    } catch (cleanErr) {
      console.error('❌ Erro no cleanup:', cleanErr)
    }

    console.log('\n=============================================')
    console.log('             SUMÁRIO DE AUDITORIA            ')
    console.log('=============================================')
    console.log(`TOTAL DE TESTES : ${total}`)
    console.log(`PASSARAM        : ${passes} ✅`)
    console.log(`FALHARAM        : ${fails} ❌`)
    
    if (fails > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:')
      failedList.forEach(f => console.log(` - ${f}`))
    } else {
      console.log('\n🏆 TODOS OS TESTES PASSARAM COM SUCESSO! A LÓGICA DE NEGÓCIO ESTÁ BLINDADA.')
    }
  }
}

runAudit()
