import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    + '-' + Math.random().toString(36).slice(2, 7)
}

const BRASIL_GAME_CHALLENGES = [
  'Foto com a camisa do Brasil',
  'Capture a reação de um gol',
  'Selfie de grupo da galera',
  'O momento mais animado da torcida',
]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, location } = await request.json()

    const eventName = (name || 'Jogo do Brasil X Haiti').trim()
    const slug = generateSlug(eventName)

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Criar evento
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .insert({
        owner_id: user.id,
        name: eventName,
        date: '2026-06-19',
        time: '21:30',
        location: location || null,
        event_type: 'outros',
        slug,
        active: true,
        status: 'published',
      })
      .select('id')
      .single()

    if (eventError || !event) {
      console.error('Erro ao criar evento:', eventError)
      return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 })
    }

    // Criar desafios pré-definidos
    const challenges = BRASIL_GAME_CHALLENGES.map((title, i) => ({
      event_id: event.id,
      title,
      order_index: i,
    }))

    await supabaseAdmin.from('challenges').insert(challenges)

    // Ativar plano brasil_game
    const { error: planError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: user.id,
        plan_id: 'brasil_game',
        payment_id: `promo-brasil_game-${Date.now()}`,
        event_id: event.id,
      })

    if (planError && planError.code !== '23505') {
      console.error('Erro ao ativar plano:', planError)
      return NextResponse.json({ error: 'Erro ao ativar plano' }, { status: 500 })
    }

    return NextResponse.json({ success: true, eventId: event.id })

  } catch (error: any) {
    console.error('Brasil game create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
