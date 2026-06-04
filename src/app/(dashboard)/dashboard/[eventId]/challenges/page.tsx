'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Challenge } from '@/types'

const DEFAULT_CHALLENGES = [
  'Uma foto de grupo da sua mesa',
  'Primeira dança do casal',
  'Um brinde com os noivos',
  'Um vídeo da melhor dançarina',
  'Alguém compartilhando lágrimas de alegria',
  'Um moment doce',
  'Alguém fazendo um discurso',
  'Uma selfie',
]

export default function ChallengesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [eventId])

  async function loadChallenges() {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('event_id', eventId)
      .order('order_index')

    if (data) setChallenges(data)
    setLoading(false)
  }

  async function addChallenge(title: string) {
    if (!title.trim()) return

    const { data } = await supabase
      .from('challenges')
      .insert({
        event_id: eventId,
        title: title.trim(),
        order_index: challenges.length,
      })
      .select()
      .single()

    if (data) {
      setChallenges(prev => [...prev, data])
      setNewTitle('')
    }
  }

  async function removeChallenge(id: string) {
    await supabase.from('challenges').delete().eq('id', id)
    setChallenges(prev => prev.filter(c => c.id !== id))
  }

  async function loadDefaults() {
    setSaving(true)
    await supabase.from('challenges').delete().eq('event_id', eventId)

    const toInsert = DEFAULT_CHALLENGES.map((title, i) => ({
      event_id: eventId,
      title,
      order_index: i,
    }))

    const { data } = await supabase.from('challenges').insert(toInsert).select()
    if (data) setChallenges(data)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-warm">
        <p className="text-slate text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas-warm">
      {/* Header */}
      <div className="bg-canvas border-b border-hairline px-6 py-8">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate hover:text-ink transition text-lg leading-none cursor-pointer"
          >
            ←
          </button>
          <div>
            <span className="text-[11px] font-medium tracking-[0.2px] text-stone uppercase block mb-1">Configuração</span>
            <h1 className="text-3xl font-normal tracking-[-0.9px] text-ink">Desafios Fotográficos</h1>
            <p className="text-sm text-graphite mt-1">Personalize os desafios para os seus convidados</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">

        {challenges.length === 0 && (
          <div className="bg-canvas border border-hairline p-8 text-center flex flex-col items-center gap-4">
            <p className="text-sm text-graphite">Nenhum desafio criado ainda para este evento.</p>
            <button
              onClick={loadDefaults}
              disabled={saving}
              className="bg-primary text-on-primary text-sm px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Carregando...' : 'Usar desafios padrão'}
            </button>
          </div>
        )}

        {challenges.length > 0 && (
          <div className="bg-canvas border border-hairline divide-y divide-hairline">
            {challenges.map((challenge, i) => (
              <div key={challenge.id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-xs text-stone w-6 font-mono">{String(i + 1).padStart(2, '0')}</span>
                <p className="flex-1 text-sm text-ink">{challenge.title}</p>
                <button
                  onClick={() => removeChallenge(challenge.id)}
                  className="text-slate hover:text-red-600 transition text-lg leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-canvas border border-hairline p-5 flex items-center gap-4">
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              placeholder="Adicionar novo desafio (ex: Uma foto com os noivos)..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addChallenge(newTitle)}
              className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
            />
          </div>
          <button
            onClick={() => addChallenge(newTitle)}
            className="bg-primary text-on-primary text-sm px-5 py-2 rounded-full font-semibold hover:opacity-90 transition cursor-pointer flex-shrink-0"
          >
            Adicionar
          </button>
        </div>

        {challenges.length > 0 && (
          <button
            onClick={loadDefaults}
            disabled={saving}
            className="text-xs text-slate hover:text-ink underline transition text-center cursor-pointer"
          >
            Restaurar desafios padrão
          </button>
        )}
      </div>
    </div>
  )
}
