'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Media, Challenge } from '@/types'
import { Image as ImageIcon, Users, Trophy, ChevronLeft } from 'lucide-react'

export default function EventStatsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [event, setEvent] = useState<{ name: string; date: string } | null>(null)
  const [medias, setMedias] = useState<Media[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase.from('events').select('name, date').eq('id', eventId).single()
      if (!eventData) { router.push('/dashboard'); return }
      setEvent(eventData)

      const { data: challengeData } = await supabase.from('challenges').select('*').eq('event_id', eventId)
      if (challengeData) setChallenges(challengeData)

      const { data: mediaData } = await supabase.from('media').select('*').eq('event_id', eventId)
      if (mediaData) setMedias(mediaData)

      setLoading(false)
    }
    load()
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando métricas...</p>
      </div>
    )
  }

  // --- Calculations ---
  
  // Total guests
  const uniqueGuests = new Set(medias.map(m => m.guest_id || m.uploader_name || 'Desconhecido'))
  const totalGuests = uniqueGuests.size
  
  // Top Contributors
  const contributorMap: Record<string, number> = {}
  medias.forEach(m => {
    const name = m.uploader_name || 'Alguém'
    contributorMap[name] = (contributorMap[name] || 0) + 1
  })
  const topContributors = Object.entries(contributorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top Challenges
  const challengeMap: Record<string, number> = {}
  medias.forEach(m => {
    if (m.challenge_id) {
      challengeMap[m.challenge_id] = (challengeMap[m.challenge_id] || 0) + 1
    }
  })
  const topChallenges = Object.entries(challengeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const c = challenges.find(ch => ch.id === id)
      return { title: c?.title || 'Desafio Desconhecido', count }
    })
    
  const challengesWithEngagement = Object.keys(challengeMap).length

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
      
      {/* Header */}
      <div className="px-5 py-6 border-b border-gray-200/50 flex flex-col gap-2 bg-white/40 backdrop-blur-xl">
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/${eventId}/appearance`)}
            className="text-xs text-gray-600 font-medium hover:text-gray-900 transition border border-gray-200 bg-white/50 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
          >
            🎨 Aparência
          </button>
          <button
            onClick={() => router.push(`/dashboard/${eventId}/challenges`)}
            className="text-xs text-gray-600 font-medium hover:text-gray-900 transition border border-gray-200 bg-white/50 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
          >
            Desafios
          </button>
        </div>
        <button
          onClick={() => router.push(`/dashboard/${eventId}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit text-sm font-medium mb-2 cursor-pointer"
        >
          <ChevronLeft size={16} /> Voltar para o álbum
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resumo & Estatísticas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {event?.name} • {event && new Date(event.date).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 mt-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={22} />
            </div>
            <p className="text-3xl font-bold text-ink">{medias.length}</p>
            <p className="text-sm font-medium text-slate mt-1">Fotos e Vídeos</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Users size={22} />
            </div>
            <p className="text-3xl font-bold text-ink">{totalGuests}</p>
            <p className="text-sm font-medium text-slate mt-1">Convidados Únicos</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <Trophy size={22} />
            </div>
            <p className="text-3xl font-bold text-ink">{challengesWithEngagement}</p>
            <p className="text-sm font-medium text-slate mt-1">Desafios com Engajamento</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Contributors */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <span className="text-xl">🏆</span> Top Contribuidores
            </h3>
            
            {topContributors.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhuma foto enviada ainda.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topContributors.map(([name, count], idx) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          idx === 1 ? 'bg-gray-100 text-gray-700' : 
                          idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                        #{idx + 1}
                      </div>
                      <span className="font-semibold text-gray-800">{name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                      {count} fotos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Challenges */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <span className="text-xl">🎯</span> Desafios Favoritos
            </h3>
            
            {topChallenges.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum desafio respondido ainda.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topChallenges.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 line-clamp-1 pr-4">{item.title}</span>
                      <span className="text-sm font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                        {item.count} envios
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (item.count / medias.length) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
