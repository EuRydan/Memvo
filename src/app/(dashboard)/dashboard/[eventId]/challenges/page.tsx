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
  'Um momento doce',
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

  useEffect(() => { loadChallenges() }, [eventId])

  async function loadChallenges() {
    const { data } = await supabase
      .from('challenges').select('*').eq('event_id', eventId).order('order_index')
    if (data) setChallenges(data)
    setLoading(false)
  }

  async function addChallenge(title: string) {
    if (!title.trim()) return
    const { data } = await supabase
      .from('challenges')
      .insert({ event_id: eventId, title: title.trim(), order_index: challenges.length })
      .select().single()
    if (data) { setChallenges(prev => [...prev, data]); setNewTitle('') }
  }

  async function removeChallenge(id: string) {
    await supabase.from('challenges').delete().eq('id', id)
    setChallenges(prev => prev.filter(c => c.id !== id))
  }

  async function loadDefaults() {
    setSaving(true)
    await supabase.from('challenges').delete().eq('event_id', eventId)
    const toInsert = DEFAULT_CHALLENGES.map((title, i) => ({ event_id: eventId, title, order_index: i }))
    const { data } = await supabase.from('challenges').insert(toInsert).select()
    if (data) setChallenges(data)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  const isComplete = challenges.length >= 8

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">

      {/* Top Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 h-16"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-hairline transition-colors text-slate hover:text-ink"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </header>

      <main className="relative z-10 pt-20 px-5 pb-36 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone uppercase mb-2">Configuração</p>
          <h1
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            className="text-[1.85rem] font-bold tracking-[-0.02em] text-ink leading-tight"
          >
            Desafios Fotográficos
          </h1>
          <p className="text-sm text-slate mt-1.5">Personalize a experiência dos seus convidados</p>
        </div>

        {/* Completion badge */}
        {isComplete && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full mb-5 w-fit"
            style={{ background: 'rgba(74,197,80,0.1)', border: '1px solid rgba(74,197,80,0.25)' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#4ac550]" />
            <span className="text-[12px] font-semibold text-[#2d8a32]">{challenges.length} desafios configurados ✓</span>
          </div>
        )}

        {/* Challenges list card */}
        {challenges.length > 0 && (
          <div
            className="rounded-[18px] overflow-hidden mb-4"
            style={{
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* gradient accent */}
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #fdceb0 0%, #d0c0e8 100%)' }} />

            {challenges.map((challenge, i) => (
              <div
                key={challenge.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < challenges.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
                {/* Index number */}
                <span className="text-[12px] font-mono text-stone w-5 flex-shrink-0 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                <p className="flex-1 text-sm text-ink leading-snug">{challenge.title}</p>

                {/* Delete button */}
                <button
                  onClick={() => removeChallenge(challenge.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-stone hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {challenges.length === 0 && (
          <div
            className="rounded-[18px] p-8 text-center mb-4"
            style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <p className="text-2xl mb-2">🎯</p>
            <p className="text-sm font-semibold text-ink mb-1">Nenhum desafio ainda</p>
            <p className="text-xs text-slate mb-5">Adicione desafios personalizados ou use os padrão.</p>
            <button
              onClick={loadDefaults}
              disabled={saving}
              className="bg-ink text-white text-sm px-6 py-2.5 rounded-full font-semibold hover:opacity-85 transition disabled:opacity-50 cursor-pointer"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
            >
              {saving ? 'Carregando...' : 'Usar desafios padrão'}
            </button>
          </div>
        )}

        {/* Add challenge input */}
        <div
          className="rounded-[18px] px-5 py-4 flex items-center gap-3 mb-4"
          style={{
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          <input
            type="text"
            placeholder="Adicionar desafio..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addChallenge(newTitle)}
            className="flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-stone"
          />
          <button
            onClick={() => addChallenge(newTitle)}
            disabled={!newTitle.trim()}
            className="bg-ink text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-85 transition disabled:opacity-30 cursor-pointer flex-shrink-0"
          >
            Adicionar
          </button>
        </div>

        {/* Restore defaults link */}
        {challenges.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadDefaults}
              disabled={saving}
              className="text-xs text-slate hover:text-ink underline transition cursor-pointer"
            >
              {saving ? 'Restaurando...' : 'Restaurar desafios padrão'}
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
