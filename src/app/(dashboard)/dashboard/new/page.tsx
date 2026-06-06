'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { canCreateEvent, countActiveEvents, PLAN_LIMITS, PlanTier } from '@/lib/limits'
import { Event } from '@/types'
import { CalendarCrest } from '@/components/ui/calendar-crest'

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [date, setDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingPlan, setCheckingPlan] = useState(true)
  const [userPlan, setUserPlan] = useState<PlanTier>('essential')
  const [activeCount, setActiveCount] = useState(0)
  const [canCreate, setCanCreate] = useState(false)
  const [error, setError] = useState('')
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)

  const slugPreview = name ? generateSlug(name) : 'nome-do-evento'

  // Verification of active plan
  useEffect(() => {
    async function checkPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (error || !data || data.length === 0) {
        router.push('/pricing')
        return
      }
      
      const planId = data[0].plan_id as PlanTier
      setUserPlan(planId)

      // Fetch user's existing events to check limits
      const { data: eventsData } = await supabase
        .from('events')
        .select('date, active')
        .eq('owner_id', user.id)

      const events = (eventsData as Pick<Event, 'date' | 'active'>[]) || []
      const active = countActiveEvents(events)
      setActiveCount(active)
      setCanCreate(canCreateEvent(planId, events))

      setCheckingPlan(false)
    }
    checkPlan()
  }, [])

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth <= 768) return
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x * 24}px, ${y * 24}px)`
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${-x * 16}px, ${-y * 16}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!date) {
      setError('Por favor, selecione ao menos uma data de início no calendário.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = generateSlug(name)

    const payload: any = {
      name,
      date,
      slug,
      owner_id: user.id,
      active: true,
    }
    
    if (endDate) {
      payload.end_date = endDate
    }

    const { error } = await supabase.from('events').insert([payload])

    if (error) {
      setError('Erro ao criar evento: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden relative">

      {/* Background Orbs */}
      <div
        ref={orb1Ref}
        className="fixed top-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(254,215,170,0.55) 0%, rgba(221,214,254,0.4) 100%)',
          filter: 'blur(90px)',
        }}
      />
      <div
        ref={orb2Ref}
        className="fixed bottom-[10%] left-[-80px] w-[260px] h-[260px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(208,192,232,0.35) 0%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: 0.6,
        }}
      />

      {/* ── Top Bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 h-16"
        style={{
          background: 'rgba(250,250,250,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-hairline transition-colors text-slate hover:text-ink"
          aria-label="Voltar"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 pt-24 px-5 pb-36 max-w-lg mx-auto">
      
        {checkingPlan ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <svg className="animate-spin text-stone mb-4" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-stone font-medium">Verificando plano...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-stone uppercase mb-2">
                Nova celebração
              </p>
              <h1
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                className="text-[2rem] font-bold tracking-[-0.02em] text-ink leading-tight"
              >
                Configure seu álbum
              </h1>
              <p className="text-sm text-slate mt-1.5">
                Os convidados não precisam criar conta para enviar fotos.
              </p>
            </div>

            <form id="new-event-form" onSubmit={handleCreate} className="flex flex-col gap-6">

              {/* Event Name */}
              <div className="flex flex-col gap-2">
                <div className="floating-group">
                  <input
                    id="event_name"
                    type="text"
                    placeholder=" "
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field w-full px-5 py-4 rounded-full text-sm text-ink"
                    required
                    autoComplete="off"
                  />
                  <label htmlFor="event_name">Nome do evento</label>
                </div>

                {/* Slug preview */}
                <div className="flex items-center gap-1 px-5">
                  <span className="text-[11px] font-mono text-stone">memvo.app/e/</span>
                  <span
                    className="text-[11px] font-mono font-semibold text-slate truncate max-w-[200px]"
                    style={{ transition: 'color 0.2s' }}
                  >
                    {slugPreview}
                  </span>
                </div>
              </div>

              {/* Event Date (Calendar Crest) */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-stone mb-3 self-start px-2">Data do evento</p>
                <div className="w-full flex justify-center pb-4">
                  <CalendarCrest 
                    defaultStart={date || undefined}
                    defaultEnd={endDate || undefined}
                    onRangeChange={(start, end) => {
                      setDate(start || '')
                      setEndDate(end)
                    }}
                  />
                </div>
              </div>

              {/* Decorative card — atmosphere preview */}
              <div
                className="rounded-[18px] overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                {/* gradient band */}
                <div
                  className="h-[3.5px] w-full"
                  style={{ background: 'linear-gradient(90deg, #fdceb0 0%, #d0c0e8 100%)' }}
                />
                <div className="p-5 flex flex-col gap-3">
                  <div
                    className="w-full rounded-xl overflow-hidden"
                    style={{ aspectRatio: '16/7' }}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        background: 'linear-gradient(135deg, #fdf4ec 0%, #ede9f6 50%, #edf2fd 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div className="text-center">
                        <p className="text-4xl mb-2">🎉</p>
                        <p className="text-[11px] font-semibold text-stone uppercase tracking-widest">
                          {name || 'Seu evento'}
                        </p>
                        {date && (
                          <p className="text-[11px] text-slate mt-1">
                            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'long', year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone">
                    Prévia do álbum
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

            </form>
          </>
        )}
      </main>

      {/* ── Fixed Footer CTA ── */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-50 px-5 py-5 flex flex-col items-center gap-3"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {!checkingPlan && !canCreate ? (
          <div className="w-full max-w-lg text-center pb-2">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Você atingiu o limite de {PLAN_LIMITS[userPlan]} evento(s) ativo(s) do seu plano.
            </p>
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="w-full bg-ink text-white py-4 rounded-full text-sm font-semibold tracking-wide hover:opacity-85 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
            >
              Fazer upgrade de plano
            </button>
          </div>
        ) : (
          <>
            <button
              type="submit"
              form="new-event-form"
              disabled={loading || checkingPlan}
              className="w-full max-w-lg bg-ink text-white py-4 rounded-full text-sm font-semibold tracking-wide hover:opacity-85 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Criando evento...
                </span>
              ) : 'Criar evento'}
            </button>
            <p className="text-[11px] text-stone text-center">
              Os convidados não precisam criar conta para enviar fotos
            </p>
          </>
        )}
      </footer>

    </div>
  )
}
