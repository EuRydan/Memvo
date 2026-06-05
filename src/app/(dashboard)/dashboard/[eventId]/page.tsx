'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Media, Challenge } from '@/types'

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
    ...challenges.map(c => ({ id: c.id, label: c.title })),
    { id: 'free', label: '📷 Álbum livre' }
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

      {/* Tabs */}
      <div className="border-b border-gray-800 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {tabs.map(tab => {
            const count = tab.id === 'free'
              ? medias.filter(m => !m.challenge_id).length
              : medias.filter(m => m.challenge_id === tab.id).length

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400'
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
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {filteredMedias().map(media => (
              <div key={media.id} className="relative aspect-square bg-gray-900 group cursor-pointer">
                {media.type === 'video' ? (
                  <video
                    src={getPublicUrl(media.storage_path)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getPublicUrl(media.storage_path)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {media.uploader_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white text-xs truncate">{media.uploader_name}</p>
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
