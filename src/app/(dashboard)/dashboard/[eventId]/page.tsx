'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Media, Challenge } from '@/types'
import { Camera, Sparkles, Star, Heart } from 'lucide-react'

export default function EventGalleryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<{ id: string; name: string; date: string } | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [medias, setMedias] = useState<Media[]>([])
  const [activeTab, setActiveTab] = useState<string>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, date')
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white transition text-lg"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-semibold">{event?.name}</h1>
          <p className="text-xs text-gray-500">
            {event && new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/${eventId}/challenges`)}
            className="text-xs text-gray-400 hover:text-white transition border border-gray-700 px-3 py-1.5 rounded-lg"
          >
            Desafios
          </button>
          <span className="text-xs text-gray-500 border border-gray-700 px-3 py-1.5 rounded-lg">
            {medias.length} fotos
          </span>
        </div>
      </div>

      {/* Tabs (TabbedHeroSection style) */}
      <div className="w-full flex justify-center py-6">
        <div className="flex items-center p-1.5 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 rounded-full max-w-full overflow-x-auto scrollbar-hide">
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
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-black' : 'text-gray-400'} />
                {cleanLabel}
                {count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center justify-center font-bold ${
                    isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-gray-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-1">
        {filteredMedias().length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 text-sm">Nenhuma foto ainda neste desafio</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredMedias().map(media => (
              <div key={media.id} className="relative aspect-[9/16] bg-gray-900 group rounded-xl overflow-hidden shadow-sm">
                
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
    </div>
  )
}
