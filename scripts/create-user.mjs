// Script para criar usuario via Supabase Admin API
// Execute: node scripts/create-user.mjs

const SUPABASE_URL = 'https://zqregyrsmxdeurcxtjva.supabase.co'

// Precisamos da service_role key - obtenha em:
// https://supabase.com/dashboard/project/zqregyrsmxdeurcxtjva/settings/api
// Cole abaixo:
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Uso: node scripts/create-user.mjs <service_role_key>')
  console.error('   Obtenha a service_role key em:')
  console.error('   https://supabase.com/dashboard/project/zqregyrsmxdeurcxtjva/settings/api')
  process.exit(1)
}

const EMAIL = 'carolciandrini@gmail.com'
const PASSWORD = 'Memvo@Carol2026'
const FULL_NAME = 'Carol'
const PLAN = 'classic'

async function createUser() {
  console.log(`\n🚀 Criando conta para ${EMAIL}...`)

  // 1. Criar usuário via Admin API
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME },
    }),
  })

  const user = await res.json()

  if (!res.ok || user.error) {
    console.error('❌ Erro ao criar usuário:', user.error || user.message)
    process.exit(1)
  }

  console.log(`✅ Usuário criado! ID: ${user.id}`)

  // 2. Inserir plano na tabela user_plans
  const planRes = await fetch(`${SUPABASE_URL}/rest/v1/user_plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      user_id: user.id,
      plan_id: PLAN,
      payment_id: `complimentary-carol-${user.id.slice(0, 8)}`,
    }),
  })

  if (!planRes.ok) {
    const err = await planRes.text()
    console.error('❌ Erro ao salvar plano:', err)
    process.exit(1)
  }

  console.log(`✅ Plano "${PLAN}" associado com sucesso!`)
  console.log(`\n🎉 Tudo pronto! Dados de acesso:`)
  console.log(`   E-mail: ${EMAIL}`)
  console.log(`   Senha:  ${PASSWORD}`)
  console.log(`   Plano:  Clássico (3 eventos)`)
  console.log(`   Login:  https://memvo.vercel.app/login\n`)
}

createUser().catch(console.error)
