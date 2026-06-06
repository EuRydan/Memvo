'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Media, Challenge } from '@/types'
import { Camera, Sparkles, Star, Heart, Share } from 'lucide-react'
import { StoryGenerator } from '@/components/StoryGenerator'
import { EventShareCard } from '@/components/EventShareCard'

export default function EventGalleryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<{ id: string; name: string; date: string; slug: string; google_refresh_token?: string; cover_url?: string } | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [medias, setMedias] = useState<Media[]>([])
  const [activeTab, setActiveTab] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, date, slug, google_refresh_token, cover_url')
        .eq('id', eventId)
        .single()

      if (!eventData) { router.push('/dashboard'); return }
      setEvent(eventData)

      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('event_id', eventId)
        .order('order_index')

      if (challengeData) {
        setChallenges(challengeData)
        if (challengeData.length > 0) setActiveTab(challengeData[0].id)
      }

      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (mediaData) setMedias(mediaData)
      setLoading(false)
    }

    load()
  }, [eventId])

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  function filteredMedias() {
    if (activeTab === 'free') return medias.filter(m => !m.challenge_id)
    return medias.filter(m => m.challenge_id === activeTab)
  }

  const tabs = [
    ...challenges.map(c => ({ id: c.id, label: c.title }))
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 text-sm">Carregando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-50 mix-blend-multiply animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, #f4c5a8 0%, #d4bde8 100%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[40%] h-[50%] rounded-full opacity-40 mix-blend-multiply animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, #d4bde8 0%, #f4c5a8 100%)', filter: 'blur(100px)' }}
        />
      </div>

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200/50 flex items-center gap-4 relative z-10 bg-white/40 backdrop-blur-xl">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-500 hover:text-gray-900 transition text-lg"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{event?.name}</h1>
          <p className="text-xs text-gray-500">
            {event && new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/${eventId}/challenges`)}
            className="text-xs text-gray-600 font-medium hover:text-gray-900 transition border border-gray-200 bg-white/50 px-3 py-1.5 rounded-lg shadow-sm"
          >
            Desafios
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-gray-900 font-semibold hover:bg-gray-100 transition border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Share size={14} />
            Compartilhar
          </button>
          
          <button
            onClick={() => {
              if (event?.google_refresh_token) {
                alert("Google Drive já está conectado!")
              } else {
                window.location.href = `/api/auth/google?eventId=${eventId}`
              }
            }}
            className={`text-xs font-medium transition px-3 py-1.5 rounded-lg shadow-sm ${
              event?.google_refresh_token
                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            {event?.google_refresh_token ? 'Drive Conectado ✓' : 'Conectar GDrive'}
          </button>

          <span className="text-xs text-gray-600 font-medium border border-gray-200 bg-white/50 px-3 py-1.5 rounded-lg shadow-sm">
            {medias.length} fotos
          </span>
        </div>
      </div>

      {/* Tabs (TabbedHeroSection style) */}
      <div className="w-full flex justify-center py-6 relative z-10">
        <div className="flex items-center p-1.5 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full max-w-full overflow-x-auto scrollbar-hide shadow-sm">
          {tabs.map((tab, index) => {
            const count = medias.filter(m => m.challenge_id === tab.id).length
            const isActive = activeTab === tab.id
            
            // Cycle through some generic icons
            const icons = [Camera, Sparkles, Star, Heart]
            const Icon = icons[index % icons.length]

            // Remove emojis from the label using a simple regex
            const cleanLabel = tab.label.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim()

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                {cleanLabel}
                {count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center justify-center font-bold ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'bg-gray-100/50 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Story Viral Generator */}
      {event && medias.length > 0 && (
        <StoryGenerator event={event} medias={medias} />
      )}

      {/* Event Share Card (Inline only if no photos) */}
      {event && medias.length === 0 && (
        <div className="px-4 pb-2 max-w-lg mx-auto w-full relative z-10">
          <EventShareCard
            eventName={event.name}
            eventDate={new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
            inviteLink={`${typeof window !== 'undefined' ? window.location.origin : 'https://memvor.netlify.app'}/e/${event.slug}`}
            guestCount={new Set(medias.map(m => m.uploader_name).filter(Boolean)).size}
            photoCount={medias.length}
            slug={event.slug}
            coverUrl={event.cover_url}
          />
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 p-2 md:p-4 relative z-10 max-w-6xl mx-auto w-full">
        {filteredMedias().length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-sm font-medium">Nenhuma foto ainda neste desafio</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredMedias().map(media => (
              <div key={media.id} className="relative aspect-[9/16] bg-gray-100 group rounded-2xl overflow-hidden shadow-sm border border-gray-200/50">
                
                {/* Download Button */}
                <a
                  href={getPublicUrl(media.storage_path) + "?download="}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10 backdrop-blur-sm"
                  title="Baixar arquivo"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>

                {media.type === 'video' ? (
                  <video
                    src={getPublicUrl(media.storage_path)}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={getPublicUrl(media.storage_path)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {media.uploader_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white text-sm font-medium truncate">{media.uploader_name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {isShareModalOpen && event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)} />
          <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-colors z-50"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <EventShareCard
              eventName={event.name}
              eventDate={new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              inviteLink={`${typeof window !== 'undefined' ? window.location.origin : 'https://memvor.netlify.app'}/e/${event.slug}`}
              guestCount={new Set(medias.map(m => m.uploader_name).filter(Boolean)).size}
              photoCount={medias.length}
              slug={event.slug}
              coverUrl={event.cover_url}
            />
          </div>
        </div>
      )}
    </div>
  )
}
