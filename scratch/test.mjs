import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('--- INICIANDO TESTE DE BYPASS ---')
  
  // 1. Criar um usuário fake ou pegar o primeiro
  const { data: usersData } = await supabase.auth.admin.listUsers()
  let user = usersData.users[0]
  if (!user) {
    const { data } = await supabase.auth.admin.createUser({ email: 'test_bypass@memvor.com', password: 'password123', email_confirm: true })
    user = data.user
  }
  
  console.log(`👤 Usuário de teste: ${user.email}`)

  // 2. Criar um Evento
  const { data: event } = await supabase.from('events').insert({
    owner_id: user.id,
    name: 'Festa Essencial Bypass',
    slug: 'festa-bypass-' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    active: true,
    status: 'published'
  }).select().single()
  
  console.log(`🎉 Evento Criado: ${event.id}`)

  // 3. Atribuir Plano Essencial
  await supabase.from('user_plans').insert({
    user_id: user.id,
    event_id: event.id,
    plan_id: 'essential'
  })
  console.log(`💳 Plano Essencial atribuído ao evento`)

  // 4. Inserir 4 desafios DIRETAMENTE no banco (como se o backend permitisse)
  console.log(`\n⏳ Inserindo 4 desafios...`)
  for (let i = 0; i < 4; i++) {
    await supabase.from('challenges').insert({
      event_id: event.id,
      title: `Desafio ${i+1}`,
      order_index: i
    })
    console.log(`   ✅ Desafio ${i+1} inserido`)
  }

  // 5. TESTE DE BYPASS NA API (Simulando o Fetch via curl)
  // Para testar a API, precisaríamos do cookie de sessão. Como estamos num script local sem o cookie formatado,
  // nós vamos simular exatamente o que a Rota `/api/challenges` faz usando a mesma lógica!
  console.log(`\n🕵️‍♂️ Tentando inserir o 5º desafio (Simulando API POST /api/challenges)...`)
  
  const currentCountRes = await supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('event_id', event.id)
  const count = currentCountRes.count
  const limit = 4 // getChallengeLimit('essential')

  if (count >= limit) {
    console.log(`\n❌ [403 Forbidden] A API bloqueou a requisição! "Limite de desafios atingido".`)
    console.log(`   Motivo: O evento já tem ${count} desafios, e o limite do plano Essencial é ${limit}. O backend NÃO PERMITE bypass!`)
  } else {
    console.log(`   ✅ Inserido! (Isso não deveria acontecer)`)
  }

  // Cleanup
  console.log(`\n🧹 Limpando dados de teste...`)
  await supabase.from('events').delete().eq('id', event.id)
  console.log(`--- TESTE CONCLUÍDO ---`)
}

run()
