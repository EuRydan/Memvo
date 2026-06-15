'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isEventLocked, UserPlanRecord, isTelaoEnabled } from '@/lib/limits'
import { Media, Challenge } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'

export default function TelaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [event, setEvent] = useState<any>(null)
  const [medias, setMedias] = useState<Media[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  
  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [telaoEnabled, setTelaoEnabled] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from('events').select('id, name, date, active, owner_id, status').eq('slug', slug).eq('active', true).single()
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setEvent(data)

      const { data: ownerPlansData } = await supabase
        .from('user_plans')
        .select('event_id, plan_id')
        .eq('user_id', data.owner_id)

      const ownerPlans: UserPlanRecord[] = (ownerPlansData || []) as UserPlanRecord[]
      const planId = ownerPlans.find(p => p.event_id === data.id)?.plan_id
        || ownerPlans[ownerPlans.length - 1]?.plan_id
        || 'none'

      const enabled = isTelaoEnabled(planId)
      setTelaoEnabled(enabled)

      if (!enabled) {
        setLoading(false)
        return
      }

      if (isEventLocked(data.id, ownerPlans, data)) {
        setIsLocked(true)
        setLoading(false)
        return
      }

      await loadChallenges(data.id)
      await loadMedias(data.id)
      subscribeRealtime(data.id)
      
      setLoading(false)
    }
    loadEvent()
  }, [slug])

  async function loadMedias(eventId: string) {
    const { data } = await supabase.from('media').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    if (data) setMedias(data)
  }

  async function loadChallenges(eventId: string) {
    const { data } = await supabase.from('challenges').select('*').eq('event_id', eventId)
    if (data) setChallenges(data)
  }

  function subscribeRealtime(eventId: string) {
    supabase.channel('media-changes-telao')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'media', filter: `event_id=eq.${eventId}` },
        (payload) => setMedias(prev => {
          // Put new photos at the start of the queue
          return [payload.new as Media, ...prev]
        })
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'media', filter: `event_id=eq.${eventId}` },
        (payload) => setMedias(prev => prev.filter(m => m.id !== payload.old.id))
      )
      .subscribe()
  }

  const getPublicUrl = (path: string) => {
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      // Se não há mídias, mantém 0
      if (medias.length === 0) return 0
      // Avança. Se chegou no final, volta ao topo (0)
      return prev + 1 >= medias.length ? 0 : prev + 1
    })
  }

  useEffect(() => {
    if (medias.length === 0) return

    let timeoutId: NodeJS.Timeout

    const currentMedia = medias[currentIndex]
    
    // Fallback de segurança se o índice atual quebrar por alguma deleção
    if (!currentMedia) {
      setCurrentIndex(0)
      return
    }

    if (currentMedia.type === 'video') {
      // Para vídeos, forçamos o pulo aos 15s máximo.
      timeoutId = setTimeout(() => {
        nextSlide()
      }, 15000)
    } else {
      // Para fotos, 5s
      timeoutId = setTimeout(() => {
        nextSlide()
      }, 5000)
    }

    return () => clearTimeout(timeoutId)
  }, [currentIndex, medias])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <svg className="animate-spin text-white/50" width="32" height="32" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (notFound) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-5">Evento não encontrado.</div>
  
  if (!telaoEnabled) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5 text-center">
      <div className="bg-white/10 p-8 rounded-3xl max-w-md backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-3">Modo Telão</h2>
        <p className="text-white/80 mb-6">Esta experiência imersiva de Slideshow ao vivo está disponível apenas para eventos no plano <strong>Premium</strong>.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm transition hover:bg-gray-200"
        >
          Conheça o Memvor Premium
        </button>
      </div>
    </div>
  )

  if (isLocked) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-5 text-center">Evento aguardando ativação.</div>

  const currentMedia = medias[currentIndex]
  const currentChallenge = currentMedia?.challenge_id ? challenges.find(c => c.id === currentMedia.challenge_id) : null

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {currentMedia ? (
          <motion.div
            key={currentMedia.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            {currentMedia.type === 'video' ? (
              <video
                src={getPublicUrl(currentMedia.storage_path)}
                autoPlay
                muted
                onEnded={nextSlide}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={getPublicUrl(currentMedia.storage_path)}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white/50"
          >
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-50" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-2h8l2 2h3v12H3V7zm5 6a4 4 0 108 0 4 4 0 00-8 0z" />
            </svg>
            <p className="tracking-widest uppercase text-sm">Aguardando momentos mágicos...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Info Overlay */}
      {currentMedia && (
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
          <h1 className="text-white/90 text-2xl md:text-3xl font-bold drop-shadow-md mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {event?.name}
          </h1>
          {currentChallenge && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white/90 text-sm font-medium border border-white/10 shadow-sm">
              <span className="text-white">📸</span> {currentChallenge.title}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
