'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendarCrest } from '@/components/ui/calendar-crest'
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

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Initial Check & Load Draft
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Load draft from localStorage
      const draft = localStorage.getItem('memvor_onboarding_draft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          if (parsed.step) setStep(parsed.step)
          if (parsed.eventType) setEventType(parsed.eventType)
          if (parsed.name) setName(parsed.name)
          if (parsed.date) setDate(parsed.date)
          if (parsed.endDate) setEndDate(parsed.endDate)
          if (parsed.time) setTime(parsed.time)
          if (parsed.location) setLocation(parsed.location)
          if (parsed.additionalInfo) setAdditionalInfo(parsed.additionalInfo)
          if (parsed.selectedChallenges) setSelectedChallenges(parsed.selectedChallenges)
        } catch (err) {}
      }
      setLoading(false)
    }
    init()
  }, [])

  // 2. Save draft on change
  useEffect(() => {
    if (loading) return
    const draft = {
      step, eventType, name, date, endDate, time, location, additionalInfo, selectedChallenges
    }
    localStorage.setItem('memvor_onboarding_draft', JSON.stringify(draft))
  }, [step, eventType, name, date, endDate, time, location, additionalInfo, selectedChallenges, loading])

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

  const slugPreview = name ? generateSlug(name) : 'nome-do-evento'

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => Math.max(1, s - 1))

  // Toggle challenge selection
  const toggleChallenge = (title: string) => {
    setSelectedChallenges(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  // SAVE EVENT TO DB (Before Step 7)
  const saveEventToDB = async () => {
    setSavingEvent(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let coverUrl = null
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const fileName = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: storageError, data: storageData } = await supabase.storage
          .from('media').upload(fileName, coverFile, { cacheControl: '3600', upsert: false })
        
        if (!storageError && storageData) {
          coverUrl = supabase.storage.from('media').getPublicUrl(storageData.path).data.publicUrl
        }
      }

      const payload: any = {
        name,
        date,
        slug: generateSlug(name),
        owner_id: user.id,
        active: true,
        event_type: eventType,
        time,
        location,
        additional_info: additionalInfo
      }
      
      if (endDate) payload.end_date = endDate
      if (coverUrl) payload.cover_url = coverUrl

      // Insert event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([payload])
        .select('id')
        .single()

      if (eventError) throw eventError

      const newEventId = eventData.id
      setSavedEventId(newEventId)

      // Insert challenges
      if (selectedChallenges.length > 0) {
        const challengesPayload = selectedChallenges.map((title, idx) => ({
          event_id: newEventId,
          title,
          order_index: idx
        }))
        await supabase.from('challenges').insert(challengesPayload)
      }

      // Clear draft
      localStorage.removeItem('memvor_onboarding_draft')

      // Move to step 7
      setStep(7)
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar o evento.')
    } finally {
      setSavingEvent(false)
    }
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

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col relative overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="fixed top-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(254,215,170,0.55) 0%, rgba(221,214,254,0.4) 100%)', filter: 'blur(90px)' }} />
      <div className="fixed bottom-[10%] left-[-80px] w-[260px] h-[260px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(208,192,232,0.35) 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.6 }} />

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-16"
        style={{ background: 'rgba(250,250,250,0.82)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Logo className="h-5 w-auto text-ink" />
        <div className="flex gap-1.5">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-ink' : i < step ? 'w-2 bg-stone-300' : 'w-2 bg-stone-200'}`} />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center pt-24 px-5 pb-32 max-w-lg mx-auto w-full">
        
        {step === 1 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-ink mb-2" style={{ fontFamily: 'Georgia, serif' }}>Bem-vindo!</h1>
            <p className="text-slate mb-8">Vamos configurar seu espaço de memórias.</p>
            
            <button onClick={handleNext} className="w-full bg-white border border-gray-200 rounded-[24px] p-6 text-left hover:shadow-lg transition-all group flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📸
                </div>
                <h3 className="text-lg font-bold text-ink">Criar um novo álbum compartilhado</h3>
                <p className="text-sm text-stone mt-1">Casamentos, aniversários, celebrações e mais.</p>
              </div>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-stone group-hover:text-ink group-hover:translate-x-1 transition-all">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2">Etapa 2 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-6" style={{ fontFamily: 'Georgia, serif' }}>Qual é o tipo de evento?</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {['Casamento', 'Aniversário', 'Viagem', 'Celebração', 'Formatura', 'Outros'].map(type => (
                <button
                  key={type}
                  onClick={() => { setEventType(type); handleNext(); }}
                  className={`p-5 rounded-[20px] text-center border-2 transition-all hover:scale-105 active:scale-95 ${eventType === type ? 'border-ink bg-ink text-white shadow-md' : 'border-gray-100 bg-white text-ink hover:border-gray-200'}`}
                >
                  <span className="block text-2xl mb-2">
                    {type === 'Casamento' ? '💍' : type === 'Aniversário' ? '🎂' : type === 'Viagem' ? '✈️' : type === 'Celebração' ? '🎉' : type === 'Formatura' ? '🎓' : '✨'}
                  </span>
                  <span className="font-semibold text-sm">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2">Etapa 3 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-6" style={{ fontFamily: 'Georgia, serif' }}>Personalize seu álbum</h2>
            
            <div className="flex flex-col gap-6">
              <div className="floating-group">
                <input
                  id="event_name"
                  type="text"
                  placeholder=" "
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field w-full px-5 py-4 rounded-full text-sm text-ink bg-white border border-gray-200"
                  required
                />
                <label htmlFor="event_name">Nome do evento</label>
              </div>

              {/* Cover Upload */}
              <div className="rounded-[18px] overflow-hidden bg-white/90 backdrop-blur shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
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
                    className="w-full rounded-xl overflow-hidden cursor-pointer group relative bg-stone-50 border-2 border-dashed border-gray-200"
                    style={{ aspectRatio: '16/9' }}
                  >
                    {coverPreviewUrl ? (
                      <img src={coverPreviewUrl} alt="Capa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone group-hover:text-ink group-hover:bg-gray-50 transition-colors">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-xs font-semibold">Adicionar foto de capa</span>
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
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2">Etapa 4 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-2" style={{ fontFamily: 'Georgia, serif' }}>Desafios de Fotos</h2>
            <p className="text-sm text-slate mb-6">Sugira desafios para seus convidados. Eles receberão missões diferentes para engajar mais!</p>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
              {defaultChallenges.length === 0 && <p className="text-sm text-stone text-center py-4">Carregando sugestões...</p>}
              {defaultChallenges.map((challenge, idx) => {
                const isSelected = selectedChallenges.includes(challenge)
                return (
                  <button
                    key={idx}
                    onClick={() => toggleChallenge(challenge)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${isSelected ? 'border-ink bg-ink/5' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${isSelected ? 'bg-ink border-ink' : 'border-gray-300'}`}>
                      {isSelected && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <span className={`text-sm ${isSelected ? 'font-semibold text-ink' : 'text-slate'}`}>{challenge}</span>
                  </button>
                )
              })}
              {/* Option to create from scratch can just be an empty unselected list, they can add later in dashboard */}
            </div>
            <p className="text-xs text-stone mt-4 text-center">Você poderá criar desafios personalizados do zero depois no painel.</p>
          </div>
        )}

        {step === 5 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2">Etapa 5 de 7</p>
            <h2 className="text-3xl font-bold text-ink mb-6" style={{ fontFamily: 'Georgia, serif' }}>Detalhes do Evento</h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center mb-2">
                <p className="text-sm text-stone mb-3 self-start px-2 font-medium">Data do evento</p>
                <CalendarCrest 
                  defaultStart={date || undefined} defaultEnd={endDate || undefined}
                  onRangeChange={(start, end) => { setDate(start || ''); setEndDate(end) }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="floating-group">
                  <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field w-full px-5 py-4 rounded-2xl text-sm text-ink bg-white border border-gray-200" placeholder=" " />
                  <label htmlFor="time">Horário</label>
                </div>
                <div className="floating-group">
                  <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-field w-full px-5 py-4 rounded-2xl text-sm text-ink bg-white border border-gray-200" placeholder=" " />
                  <label htmlFor="location">Local</label>
                </div>
              </div>

              <div className="floating-group">
                <textarea id="additionalInfo" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} className="input-field w-full px-5 py-4 rounded-2xl text-sm text-ink bg-white border border-gray-200 resize-none h-24" placeholder=" " />
                <label htmlFor="additionalInfo">Informações adicionais</label>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <p className="text-[11px] font-semibold tracking-widest text-stone uppercase mb-2">Etapa 6 de 7</p>
             <h2 className="text-3xl font-bold text-ink mb-2" style={{ fontFamily: 'Georgia, serif' }}>Alertas e Mensagens</h2>
             
             <div className="relative mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 opacity-60 overflow-hidden">
               {/* Lock Badge */}
               <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                 Em breve (Beta)
               </div>

               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                 <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
               </div>
               <h3 className="text-lg font-bold text-ink mb-2">Comunicação via WhatsApp</h3>
               <p className="text-sm text-slate mb-4">Comunique-se com todos os convidados que leram o QR Code e adicionaram o WhatsApp. Dispare mensagens personalizadas quando quiser.</p>
               
               <div className="h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                 <span className="text-xs font-semibold text-stone uppercase tracking-wider">Recurso bloqueado</span>
               </div>
             </div>
          </div>
        )}

        {step === 7 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🎁</div>
              <h2 className="text-3xl font-bold text-ink mb-2" style={{ fontFamily: 'Georgia, serif' }}>Escolha o melhor plano</h2>
              <p className="text-sm text-slate">Para celebrar este evento, preparamos benefícios exclusivos para você.</p>
            </div>

            <div className="bg-gradient-to-br from-[#fdf4ec] to-[#ede9f6] rounded-[24px] p-6 shadow-sm border border-white mb-6">
               <h3 className="text-sm font-bold text-ink mb-4 uppercase tracking-widest">Seu presente inclui:</h3>
               <ul className="flex flex-col gap-3">
                 <li className="flex items-center gap-3 text-sm font-medium text-ink">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">✨</div> 1 ano de armazenamento
                 </li>
                 <li className="flex items-center gap-3 text-sm font-medium text-ink">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">☁️</div> Cópia segura na nuvem e Google Drive
                 </li>
                 <li className="flex items-center gap-3 text-sm font-medium text-ink">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">📦</div> Download das fotos em ZIP
                 </li>
               </ul>
            </div>

            <div className="floating-group mb-6">
               <input id="promocode" type="text" placeholder=" " className="input-field w-full px-5 py-4 rounded-full text-sm text-ink bg-white border border-gray-200" />
               <label htmlFor="promocode">Possui código promocional?</label>
            </div>
            
            <p className="text-xs text-stone text-center mb-2">Ajudaremos você a escolher a melhor opção baseada no seu número de convidados.</p>
          </div>
        )}

      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-5 py-5 flex items-center justify-between gap-3 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <div className="w-full max-w-lg mx-auto flex justify-between gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={savingEvent}
              className="px-6 py-4 rounded-full text-sm font-semibold text-ink bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
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
              else if (step === 5 && date) saveEventToDB() // Save before step 6/7
              else if (step === 6) handleNext()
              else if (step === 7) router.push('/pricing') // Redirect to checkout/pricing
            }}
            disabled={savingEvent || (step === 2 && !eventType) || (step === 3 && !name) || (step === 5 && !date)}
            className="flex-1 bg-ink text-white py-4 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {savingEvent ? 'Salvando evento...' : step === 5 ? 'Avançar' : step === 7 ? 'Ver Planos e Assinar' : 'Continuar'}
            {!savingEvent && step !== 7 && <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>
      </footer>

    </div>
  )
}
