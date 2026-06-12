'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Challenge } from '@/types'
import { isEventLocked } from '@/lib/limits'
import { SelectNative } from '@/components/ui/select-native'
import { ButtonColorful } from '@/components/ui/button-colorful'

const DEFAULT_CHALLENGES = {
  wedding: [
    'Uma foto de grupo da sua mesa',
    'Primeira dança do casal',
    'Um brinde com os noivos',
    'Um vídeo da melhor dançarina',
    'Alguém compartilhando lágrimas de alegria',
    'Um momento doce',
    'Alguém fazendo um discurso',
    'Uma selfie',
  ],
  birthday: [
    'Uma foto com o(a) aniversariante',
    'O momento do parabéns',
    'Um brinde especial',
    'A decoração da mesa do bolo',
    'A pessoa mais animada da festa',
    'Uma foto de grupo divertida',
    'O melhor passinho de dança',
    'Alguém comendo o primeiro pedaço de bolo',
  ],
  corporate: [
    'Uma foto com a equipe',
    'O momento do brinde',
    'Uma selfie com o chefe',
    'A melhor foto de networking',
    'Alguém rindo muito',
    'A mesa de comidinhas',
    'Uma foto criativa com o logo da empresa',
    'O colega mais animado do evento',
  ],
  general: [
    'Uma selfie',
    'Um brinde',
    'A pessoa mais bem vestida',
    'A comida mais gostosa',
    'Um momento engraçado',
    'A melhor dança',
    'Uma foto com quem você conheceu hoje',
    'Um sorriso sincero',
  ],
  bridal_shower: [
    'O presente mais engraçado',
    'Um momento divertido nas brincadeiras',
    'A noiva pagando um mico',
    'Uma foto de grupo com as madrinhas',
    'A mesa de doces',
    'Um brinde à noiva',
    'A reação ao abrir os presentes',
    'A convidada mais animada',
  ],
  gender_reveal: [
    'A reação dos pais no momento da revelação',
    'Alguém do Team Menino vibrando',
    'Alguém do Team Menina vibrando',
    'A cara de surpresa de um convidado',
    'A fumaça/confetes no ar',
    'Uma foto com os avós emocionados',
    'A decoração maravilhosa',
    'Os papais se abraçando',
  ],
  baby_shower: [
    'A mãe exibindo o barrigão',
    'Os pais juntos',
    'A mesa do bolo',
    'Alguém apertando a bochecha (ou a barriga!)',
    'A foto com o sapatinho do bebê',
    'O momento de abrir as fraldas',
    'Uma foto com as vovós',
    'A lembrancinha do evento',
  ],
}

type EventCategory = keyof typeof DEFAULT_CHALLENGES

const EVENT_TYPES: Record<EventCategory, string> = {
  wedding: 'Casamento',
  birthday: 'Aniversário / 15 anos',
  corporate: 'Evento Corporativo',
  bridal_shower: 'Chá de Panela',
  gender_reveal: 'Chá Revelação',
  baby_shower: 'Chá de Bebê',
  general: 'Outras Celebrações',
}

export default function ChallengesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('wedding')
  const [challengeLimit, setChallengeLimit] = useState<number>(Infinity)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => { loadChallenges() }, [eventId])

  async function loadChallenges() {
    // Buscar usuário atual para ver o plano
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: planData } = await supabase
        .from('user_plans')
        .select('plan_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      const type = planData?.plan_id || 'none'
      if (type === 'essential') setChallengeLimit(5)
      else if (type === 'classic') setChallengeLimit(Infinity)
      else if (type === 'premium') setChallengeLimit(Infinity)
      else if (type === 'freemium') setChallengeLimit(1)
      else setChallengeLimit(0) // Sem plano não pode adicionar (embora a view em si devesse estar bloqueada)

      const { data: allEvents } = await supabase
        .from('events')
        .select('id, date, active, created_at, status')
        .eq('owner_id', user.id)
        
      if (allEvents && isEventLocked(eventId, allEvents, type)) {
        setIsLocked(true)
        setLoading(false)
        return
      }
    }

    const { data } = await supabase
      .from('challenges').select('*').eq('event_id', eventId).order('order_index')
    if (data) setChallenges(data)
    setLoading(false)
  }

  async function addChallenge(title: string) {
    if (!title.trim()) return
    if (challenges.length >= challengeLimit) {
      alert(`Você atingiu o limite de ${challengeLimit} desafios do seu plano.`)
      return
    }
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
    // Limita a quantidade de desafios padrão pelo limite do plano
    const challengesToInsert = DEFAULT_CHALLENGES[selectedCategory].slice(0, challengeLimit)
    const toInsert = challengesToInsert.map((title, i) => ({ event_id: eventId, title, order_index: i }))
    const { data } = await supabase.from('challenges').insert(toInsert).select()
    if (data) setChallenges(data)
    setSaving(false)
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center relative z-10 pt-24 pb-28">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-ink mb-2">Desafios Bloqueados</h2>
          <p className="text-sm text-slate mb-6">Você precisa ativar este evento efetuando o pagamento do plano para configurar os desafios.</p>
          <button onClick={() => router.push(`/pricing?eventId=${eventId}`)} className="bg-ink text-white font-semibold py-3 px-6 rounded-full w-full hover:opacity-90 transition-opacity">
            Desbloquear Agora
          </button>
        </div>
      </div>
    )
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

  const isComplete = challenges.length > 0 && challenges.length >= (challengeLimit === Infinity ? 8 : challengeLimit)

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
            <div className="flex flex-col sm:flex-row gap-3 max-w-[340px] mx-auto mt-4">
              <div className="w-full sm:flex-1">
                <SelectNative 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value as EventCategory)}
                  disabled={saving}
                >
                  {(Object.entries(EVENT_TYPES) as [EventCategory, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </SelectNative>
              </div>
              <div className="w-full sm:w-auto">
                <ButtonColorful
                  onClick={loadDefaults}
                  disabled={saving || challengeLimit === 0}
                  label={saving ? 'Carregando...' : 'Carregar'}
                  className="w-full h-full"
                />
              </div>
            </div>
            {challengeLimit === 0 && <p className="text-xs text-red-500 mt-3 font-semibold">Você precisa de um plano para adicionar desafios.</p>}
          </div>
        )}

        {/* Add challenge input */}
        <div className="mb-4">
          <div
            className={`rounded-[18px] px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${challenges.length >= challengeLimit ? 'opacity-50 pointer-events-none' : ''}`}
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
              disabled={challenges.length >= challengeLimit}
              className="w-full sm:flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-stone py-1"
            />
            <button
              onClick={() => addChallenge(newTitle)}
              disabled={!newTitle.trim() || challenges.length >= challengeLimit}
              className="w-full sm:w-auto bg-ink text-white text-xs font-semibold px-4 py-2.5 sm:py-2 rounded-full hover:opacity-85 transition disabled:opacity-30 cursor-pointer flex-shrink-0"
            >
              Adicionar
            </button>
          </div>
          {challenges.length >= challengeLimit && challengeLimit > 0 && challengeLimit !== Infinity && (
            <p className="text-[11px] font-semibold text-[#de3b3b] text-center mt-2 px-4">
              Você atingiu o limite de {challengeLimit} desafios do seu plano. Para adicionar mais, faça o upgrade.
            </p>
          )}
        </div>

        {/* Restore defaults link */}
        {challenges.length > 0 && (
          <div className="text-center flex flex-col items-center gap-3 mt-4 pt-4 border-t border-slate/10">
            <p className="text-xs font-semibold text-slate uppercase tracking-wider">Substituir todos por padrão</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[340px] w-full mx-auto">
              <div className="w-full sm:flex-1">
                <SelectNative 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value as EventCategory)}
                  disabled={saving}
                  className="w-full"
                >
                  {(Object.entries(EVENT_TYPES) as [EventCategory, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </SelectNative>
              </div>
              <button
                onClick={loadDefaults}
                disabled={saving}
                className="w-full sm:w-auto bg-[#f0f0f0] text-ink text-sm px-4 h-10 sm:h-9 rounded-lg font-semibold hover:bg-hairline transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {saving ? '...' : 'Restaurar'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
