'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendarCrest } from '@/components/ui/calendar-crest'
import { getChallengeLimit } from '@/lib/limits'
import { Logo } from '@/components/Logo'

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  
  // Form State
  const [eventType, setEventType] = useState('')
  const [name, setName] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [date, setDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string | null>(null)
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  
  // Available Default Challenges (could be fetched from DB)
  const [defaultChallenges, setDefaultChallenges] = useState<string[]>([])
  
  const [error, setError] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)
  const [savedEventId, setSavedEventId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [hasPlan, setHasPlan] = useState(false)
  const [challengeLimit, setChallengeLimit] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Initial Check & Load Draft
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)

      const { data: plansData } = await supabase
        .from('user_plans')
        .select('id, plan_id, event_id')
        .eq('user_id', user.id)
        
      const legacyPlan = plansData?.find(p => p.event_id === null && p.plan_id && p.plan_id !== 'none')
      setHasPlan(!!legacyPlan)

      // For users without a plan yet (first onboarding), use the classic limit (7)
      // so they can select a meaningful number of challenges before choosing a plan.
      // The actual limit is enforced in the dashboard after payment.
      const planLimit = legacyPlan ? getChallengeLimit(legacyPlan.plan_id) : getChallengeLimit('classic')
      setChallengeLimit(planLimit)

      // Check if forcing a new event
      const params = new URLSearchParams(window.location.search)
      if (params.get('new') === 'true') {
        fetch('/api/onboarding/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: {} })
        }).catch(() => {})
        setLoading(false)
        return
      }

      // Load draft from backend
      try {
        const res = await fetch('/api/onboarding/draft', { cache: 'no-store' })
        const data = await res.json()
        const parsed = data.draft
        if (parsed && parsed.userId === user.id) {
          if (parsed.step) setStep(parsed.step)
          if (parsed.savedEventId) setSavedEventId(parsed.savedEventId)
          if (parsed.eventType) setEventType(parsed.eventType)
          if (parsed.name) setName(parsed.name)
          if (parsed.date) setDate(parsed.date)
          if (parsed.endDate) setEndDate(parsed.endDate)
          if (parsed.time) setTime(parsed.time)
          if (parsed.location) setLocation(parsed.location)
          if (parsed.additionalInfo) setAdditionalInfo(parsed.additionalInfo)
          if (parsed.selectedChallenges) setSelectedChallenges(parsed.selectedChallenges)
        }
      } catch (err) {
        console.error('Error loading draft', err)
      }
      setLoading(false)
    }
    init()
  }, [])

  // 2. Save draft on change (debounced implicitly by react rendering, but good enough for now, could add explicit debounce if needed)
  useEffect(() => {
    if (loading || !currentUserId) return
    const draft = {
      userId: currentUserId,
      step, eventType, name, date, endDate, time, location, additionalInfo, selectedChallenges, savedEventId
    }
    fetch('/api/onboarding/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: draft })
    }).catch(err => console.error('Error saving draft', err))
  }, [step, eventType, name, date, endDate, time, location, additionalInfo, selectedChallenges, savedEventId, loading, currentUserId])

  // 3. Fetch Challenges when eventType changes
  useEffect(() => {
    async function fetchChallenges() {
      if (!eventType) return
      const { data } = await supabase
        .from('default_challenges')
        .select('title')
        .eq('event_type', eventType)
        .limit(10)
      
      if (data && data.length > 0) {
        setDefaultChallenges(data.map(d => d.title))
      } else {
        // Fallback or generic challenges
        setDefaultChallenges([
          'Tire uma selfie com alguém que você não conhecia',
          'Fotografe o melhor prato da festa',
          'Grave um vídeo curto de um brinde',
          'Tire uma foto engraçada em grupo',
          'Capture um momento de emoção genuína'
        ])
      }
    }
    fetchChallenges()
  }, [eventType])

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => Math.max(1, s - 1))

  // Toggle challenge selection
  const toggleChallenge = (title: string) => {
    setSelectedChallenges(prev => {
      if (prev.includes(title)) return prev.filter(t => t !== title)
      if (prev.length >= challengeLimit) return prev
      return [...prev, title]
    })
  }

  // SAVE EVENT TO DB (Before Step 7)
  const saveEventToDB = async () => {
    setSavingEvent(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload: any = {
        name,
        date,
        owner_id: user.id,
        active: false,
        status: 'draft',
        event_type: eventType,
        time,
        location,
        additional_info: additionalInfo
      }
      
      if (endDate) payload.end_date = endDate

      let newEventId = savedEventId

      if (savedEventId) {
        // Update existing event (we do NOT update the slug to prevent breaking the URL)
        const { error: eventError } = await supabase
          .from('events')
          .update(payload)
          .eq('id', savedEventId)

        if (eventError) throw eventError

        // Remove old challenges before re-inserting
        await supabase.from('challenges').delete().eq('event_id', savedEventId)
      } else {
        // Insert new event
        const baseSlug = generateSlug(name)
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert([{ ...payload, slug: uniqueSlug }])
          .select('id')
          .single()

        if (eventError) throw eventError
        newEventId = eventData.id
        setSavedEventId(newEventId)
      }

      // Now handle cover upload securely via presign
      if (coverFile && newEventId) {
        const ext = coverFile.name.split('.').pop()
        
        const presignRes = await fetch('/api/media/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: newEventId,
            file_ext: ext,
            file_size: coverFile.size,
            is_cover: true
          })
        })
        
        const presignData = await presignRes.json()
        if (presignRes.ok) {
          const { token, path } = presignData
          const { error: storageError, data: storageData } = await supabase.storage
            .from('media').uploadToSignedUrl(path, token, coverFile, { cacheControl: '3600', upsert: false })
          
          if (!storageError && storageData) {
            const uploadedCoverUrl = supabase.storage.from('media').getPublicUrl(storageData.path).data.publicUrl
            await supabase.from('events').update({ cover_url: uploadedCoverUrl }).eq('id', newEventId)
          }
        }
      }

      // Insert challenges
      if (selectedChallenges.length > 0 && newEventId) {
        const challengesPayload = selectedChallenges.map((title, idx) => ({
          event_id: newEventId,
          title,
          order_index: idx
        }))
        await supabase.from('challenges').insert(challengesPayload)
      }

      // If the user already has a legacy plan (VIP invite), activate the event immediately
      // so they don't get stuck with a draft that isEventLocked() would block
      if (hasPlan && newEventId) {
        await supabase
          .from('events')
          .update({ active: true, status: 'published' })
          .eq('id', newEventId)
      }

      // Delete draft from backend (clear it)
      await fetch('/api/onboarding/draft', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ state: {} })
      }).catch(err => console.error(err))

      setStep(6)
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar o evento.')
    } finally {
      setSavingEvent(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas transition-colors duration-200">
        <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas transition-colors duration-200 flex flex-col relative overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="fixed top-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(254,215,170,0.55) 0%, rgba(221,214,254,0.4) 100%)', filter: 'blur(90px)' }} />
      <div className="fixed bottom-[10%] left-[-80px] w-[260px] h-[260px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(208,192,232,0.35) 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.6 }} />

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-16 bg-canvas/80 backdrop-blur-xl border-b border-hairline transition-colors duration-200">
        <Logo className="h-5 w-auto text-ink transition-colors" />
        <div className="flex gap-1.5">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-7 bg-ink' : i < step ? 'w-2.5 bg-ink/40' : 'w-2.5 bg-ink/10'}`} />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center pt-24 px-5 pb-32 max-w-lg mx-auto w-full">
        
        {step === 1 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-ink transition-colors mb-2 font-serif">Bem-vindo!</h1>
            <p className="text-slate transition-colors mb-8">Vamos configurar seu espaço de memórias.</p>
            
            <button onClick={handleNext} className="w-full bg-canvas-warm border border-hairline rounded-3xl p-6 text-left hover:shadow-lg transition-all group flex items-center justify-between duration-200">
              <div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📸
                </div>
                <h3 className="text-lg font-bold text-ink transition-colors">Criar um novo álbum compartilhado</h3>
                <p className="text-sm text-stone mt-1 transition-colors">Casamentos, aniversários, celebrações e mais.</p>
              </div>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-stone group-hover:text-ink group-hover:translate-x-1 transition-all">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2 transition-colors">Etapa 2 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-6 transition-colors font-serif">Qual é o tipo de evento?</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {['Casamento', 'Aniversário', 'Viagem', 'Celebração', 'Formatura', 'Outros'].map(type => (
                <button
                  key={type}
                  onClick={() => { setEventType(type); handleNext(); }}
                  className={`p-5 rounded-card-lg text-center border-2 transition-all hover:scale-105 active:scale-95 duration-200 ${eventType === type ? 'border-ink bg-ink text-canvas shadow-md' : 'border-hairline bg-canvas-warm text-ink hover:border-ink/20'}`}
                >
                  <span className="block text-2xl mb-2">
                    {type === 'Casamento' ? '💍' : type === 'Aniversário' ? '🎂' : type === 'Viagem' ? '✈️' : type === 'Celebração' ? '🎉' : type === 'Formatura' ? '🎓' : '✨'}
                  </span>
                  <span className="font-semibold text-sm transition-colors">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2 transition-colors">Etapa 3 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-6 transition-colors font-serif">Personalize seu álbum</h2>
            
            <div className="flex flex-col gap-6">
              <div className="floating-group">
                <input
                  id="event_name"
                  type="text"
                  placeholder=" "
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field w-full px-5 py-4 rounded-full text-sm text-ink bg-canvas-warm border border-hairline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ink"
                  required
                />
                <label htmlFor="event_name">Nome do evento</label>
              </div>

              {/* Cover Upload */}
              <div className="rounded-card overflow-hidden bg-canvas-warm/90 backdrop-blur shadow-subtle border border-hairline transition-colors duration-200">
                <div className="p-5 flex flex-col gap-3">
                  <input 
                    type="file" accept="image/*" className="hidden" ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) { setCoverFile(file); setCoverPreviewUrl(URL.createObjectURL(file)) }
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl overflow-hidden cursor-pointer group relative bg-ink/5 border-2 border-dashed border-hairline transition-colors duration-200"
                    style={{ aspectRatio: '16/9' }}
                  >
                    {coverPreviewUrl ? (
                      <img src={coverPreviewUrl} alt="Capa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone group-hover:text-ink group-hover:bg-ink/10 transition-colors">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mb-2 transition-colors">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-xs font-semibold transition-colors">Adicionar foto de capa</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2 transition-colors">Etapa 4 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-2 transition-colors font-serif">Desafios de Fotos</h2>
            <p className="text-sm text-slate mb-4 transition-colors">Sugira desafios para seus convidados. Eles receberão missões diferentes para engajar mais!</p>

            {!hasPlan && (
              <div className="flex items-start gap-3 mb-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-4 py-3 transition-colors">
                <svg width="16" height="16" className="text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <p className="text-[13px] text-amber-800 dark:text-amber-400 leading-snug">
                  <strong>Atenção:</strong> cada evento precisa de um plano próprio. O número de desafios ativos neste evento dependerá do plano que você escolher ao final — se selecionar mais do que o plano permite, será necessário remover o excedente ou fazer upgrade no painel.
                </p>
              </div>
            )}

            <p className="text-[13px] font-semibold text-ink/80 mb-6 bg-ink/5 px-4 py-2 rounded-lg inline-block border border-ink/10 transition-colors">
              {hasPlan
                ? `Seu plano permite até ${challengeLimit === Infinity ? 'ilimitados' : challengeLimit} desafio${challengeLimit === 1 ? '' : 's'}.`
                : `Selecione até ${challengeLimit} desafios.`}
            </p>
            
            <div className="bg-canvas-warm rounded-3xl p-5 shadow-sm border border-hairline flex flex-col gap-3 max-h-[400px] overflow-y-auto transition-colors duration-200">
              {defaultChallenges.length === 0 && <p className="text-sm text-stone text-center py-4">Carregando sugestões...</p>}
              {defaultChallenges.map((challenge, idx) => {
                const isSelected = selectedChallenges.includes(challenge)
                return (
                  <button
                    key={idx}
                    onClick={() => toggleChallenge(challenge)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 ${isSelected ? 'border-ink bg-ink/10' : 'border-hairline bg-canvas-warm hover:border-ink/20'}`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${isSelected ? 'bg-ink border-ink' : 'border-hairline'}`}>
                      {isSelected && <svg width="12" height="12" fill="none" stroke="var(--color-canvas)" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <span className={`text-sm transition-colors ${isSelected ? 'font-semibold text-ink' : 'text-slate'}`}>{challenge}</span>
                  </button>
                )
              })}
              {/* Option to create from scratch can just be an empty unselected list, they can add later in dashboard */}
            </div>
            <p className="text-xs text-stone mt-4 text-center transition-colors">Você poderá criar desafios personalizados do zero depois no painel.</p>
          </div>
        )}

        {step === 5 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2 transition-colors">Etapa 5 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-6 transition-colors font-serif">Detalhes do Evento</h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center mb-2">
                <p className="text-sm text-stone mb-3 self-start px-2 font-medium transition-colors">Data do evento</p>
                <CalendarCrest 
                  defaultStart={date || undefined} defaultEnd={endDate || undefined}
                  onRangeChange={(start, end) => { setDate(start || ''); setEndDate(end) }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="floating-group">
                  <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field w-full px-5 py-4 rounded-2xl text-sm text-ink bg-canvas-warm border border-hairline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ink" placeholder=" " />
                  <label htmlFor="time">Horário</label>
                </div>
                <div className="floating-group">
                  <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-field w-full px-5 py-4 rounded-2xl text-sm text-ink bg-canvas-warm border border-hairline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ink" placeholder=" " />
                  <label htmlFor="location">Local</label>
                </div>
              </div>

              <div className="floating-group">
                <textarea id="additionalInfo" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} className="input-field w-full px-5 py-4 rounded-2xl text-sm text-ink bg-canvas-warm border border-hairline transition-colors duration-200 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-ink" placeholder=" " />
                <label htmlFor="additionalInfo">Informações adicionais</label>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-2xl px-4 py-3 transition-colors duration-200">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2 transition-colors">Etapa 6 de 7</p>
             <h2 className="text-3xl font-bold text-ink mb-2 transition-colors font-serif">Alertas e Mensagens</h2>
             <p className="text-sm text-slate mb-6 transition-colors">Prévia de um recurso que chegará em breve. Nenhuma ação necessária aqui.</p>

             <div className="relative bg-canvas-warm rounded-3xl p-6 shadow-sm border border-hairline overflow-hidden transition-colors duration-200">
               <div className="absolute top-4 right-4 bg-ink/5 text-slate text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 transition-colors duration-200">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 Em breve
               </div>

               <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 transition-colors duration-200">
                 <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
               </div>
               <h3 className="text-lg font-bold text-ink mb-2 transition-colors">Comunicação via WhatsApp</h3>
               <p className="text-sm text-slate transition-colors">Comunique-se com todos os convidados que leram o QR Code e adicionaram o WhatsApp. Dispare mensagens personalizadas quando quiser.</p>
             </div>
          </div>
        )}

        {step === 7 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-ink mb-2 transition-colors font-serif">Tudo pronto para sua celebração</h2>
              <p className="text-sm text-slate transition-colors">Revise os detalhes abaixo antes de prosseguir.</p>
            </div>

            <div className="bg-canvas-warm rounded-3xl overflow-hidden shadow-sm border border-hairline mb-6 text-sm transition-colors duration-200">
              {/* Cover preview */}
              {coverPreviewUrl && (
                <div className="w-full h-36 overflow-hidden">
                  <img src={coverPreviewUrl} alt="Capa" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex flex-col gap-0 divide-y divide-hairline p-0">
                {[
                  { label: 'Nome do Evento', value: name },
                  { label: 'Tipo', value: eventType },
                  {
                    label: 'Data',
                    value: date
                      ? endDate
                        ? `${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')} → ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}`
                        : new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')
                      : null,
                  },
                  { label: 'Horário', value: time || null },
                  { label: 'Local', value: location || null },
                  { label: 'Info adicional', value: additionalInfo || null },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4 px-6 py-3 transition-colors duration-200">
                    <span className="text-slate flex-shrink-0 transition-colors">{label}</span>
                    <span className={`font-semibold text-right transition-colors ${value ? 'text-ink' : 'text-slate opacity-40'}`}>
                      {value || '—'}
                    </span>
                  </div>
                ))}

                {/* Challenges list */}
                <div className="px-6 py-3 transition-colors duration-200">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-slate transition-colors">Desafios</span>
                    <span className={`font-semibold transition-colors ${selectedChallenges.length > 0 ? 'text-ink' : 'text-slate opacity-40'}`}>
                      {selectedChallenges.length > 0 ? `${selectedChallenges.length} selecionados` : '—'}
                    </span>
                  </div>
                  {selectedChallenges.length > 0 && (
                    <ul className="flex flex-col gap-1 mt-1">
                      {selectedChallenges.map((c, i) => (
                        <li key={i} className="text-xs text-slate flex items-start gap-2">
                          <span className="text-ink/30 flex-shrink-0 mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="floating-group mb-6">
               <input id="promocode" type="text" placeholder=" " value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="input-field w-full px-5 py-4 rounded-full text-sm text-ink bg-canvas-warm border border-hairline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ink" />
               <label htmlFor="promocode">Possui código promocional?</label>
            </div>
          </div>
        )}

      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-5 py-5 flex items-center justify-between gap-3 bg-canvas/80 backdrop-blur-xl border-t border-hairline transition-colors duration-200">
        <div className="w-full max-w-lg mx-auto flex justify-between gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={savingEvent}
              className="px-6 py-4 rounded-full text-sm font-semibold text-ink bg-ink/5 hover:bg-ink/10 transition-colors disabled:opacity-50"
            >
              Voltar
            </button>
          )}
          
          <button
            onClick={() => {
              if (step === 1) handleNext()
              else if (step === 2 && eventType) handleNext()
              else if (step === 3 && name) handleNext()
              else if (step === 4) handleNext()
              else if (step === 5 && date && time && location) saveEventToDB()
              else if (step === 6) handleNext()
              else if (step === 7) {
                setSavingEvent(true)
                fetch('/api/onboarding/draft', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ state: {} })
                }).finally(() => {
                  if (hasPlan) {
                    router.push(`/dashboard/${savedEventId || ''}`)
                  } else {
                    const query = new URLSearchParams()
                    if (savedEventId) query.append('eventId', savedEventId)
                    if (promoCode) query.append('cupom', promoCode)
                    router.push(`/pricing?${query.toString()}`)
                  }
                })
              }
            }}
            disabled={savingEvent || (step === 2 && !eventType) || (step === 3 && !name) || (step === 5 && (!date || !time || !location))}
            className="flex-1 bg-ink text-canvas py-4 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {savingEvent ? 'Salvando evento...' : step === 5 ? 'Avançar' : step === 7 ? (hasPlan ? 'Ir para o Painel' : 'Ver Planos e Assinar') : 'Continuar'}
            {!savingEvent && step !== 7 && <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>
      </footer>

    </div>
  )
}
