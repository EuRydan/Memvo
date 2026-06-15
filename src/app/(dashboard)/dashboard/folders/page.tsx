'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Media } from '@/types'
import { FolderHeart, ImageIcon, Video, Calendar } from 'lucide-react'
import MediaViewer from '@/components/MediaViewer'

export default function GlobalFoldersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [medias, setMedias] = useState<Media[]>([])
  const [eventsMap, setEventsMap] = useState<Record<string, string>>({})
  
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Buscar eventos onde o usuário é dono
      const { data: myEvents } = await supabase
        .from('events')
        .select('id, name')
        .eq('owner_id', user.id)

      if (!myEvents || myEvents.length === 0) {
        setLoading(false)
        return
      }

      const eventIds = myEvents.map(e => e.id)
      const map: Record<string, string> = {}
      myEvents.forEach(e => { map[e.id] = e.name })
      setEventsMap(map)

      // Buscar as mídias desses eventos
      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })

      if (mediaData) {
        setMedias(mediaData)
      }
      
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId })
      })
      if (!res.ok) throw new Error('Falha ao deletar')
      
      setMedias(prev => prev.filter(m => m.id !== mediaId))
      setSelectedMedia(null)
    } catch (err) {
      console.error(err)
      alert('Erro ao deletar mídia.')
    }
  }

  const getPublicUrl = (path: string) => {
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  }

  if (loading) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col px-5 h-24 pt-4"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit text-sm font-medium mb-2"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
      </header>

      <main className="relative z-10 pt-32 px-5 pb-36 max-w-5xl mx-auto w-full">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
            <FolderHeart size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Minha pasta</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Todas as fotos e vídeos capturados pelos convidados, em um só lugar.
            </p>
          </div>
        </div>

        {medias.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <ImageIcon size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sua pasta está vazia</h2>
            <p className="text-gray-500 text-sm">Nenhuma mídia foi enviada para os seus eventos ainda.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
            {medias.map((media) => {
              const url = getPublicUrl(media.storage_path)
              const eventName = eventsMap[media.event_id] || 'Evento'
              
              return (
                <div 
                  key={media.id} 
                  className="relative group rounded-xl overflow-hidden cursor-pointer shadow-sm border border-black/5 bg-gray-100 break-inside-avoid"
                  onClick={() => setSelectedMedia(media)}
                >
                  {media.type === 'video' ? (
                    <>
                      <video src={`${url}#t=0.1`} className="w-full h-auto object-cover" />
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                        <Video size={16} />
                      </div>
                    </>
                  ) : (
                    <img src={url} alt="Media" className="w-full h-auto object-cover" loading="lazy" />
                  )}
                  
                  {/* Overlay Info on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-semibold truncate">{eventName}</p>
                    <p className="text-white/80 text-[10px]">{new Date(media.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          publicUrl={getPublicUrl(selectedMedia.storage_path)}
          onClose={() => setSelectedMedia(null)}
          onDelete={() => handleDeleteMedia(selectedMedia.id)}
          canDelete={true}
        />
      )}
    </div>
  )
}
