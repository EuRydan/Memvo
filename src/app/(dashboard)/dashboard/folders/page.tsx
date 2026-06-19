'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Media, Event } from '@/types'
import { FolderHeart, ImageIcon, Video, LayoutGrid, Layers } from 'lucide-react'
import MediaViewer from '@/components/MediaViewer'

type FilterType = 'all' | 'photo' | 'video'
type ViewMode = 'grouped' | 'timeline'

export default function GlobalFoldersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [medias, setMedias] = useState<Media[]>([])
  const [events, setEvents] = useState<Pick<Event, 'id' | 'name' | 'date'>[]>([])
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grouped')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: myEvents } = await supabase
        .from('events')
        .select('id, name, date')
        .eq('owner_id', user.id)
        .order('date', { ascending: false })

      if (!myEvents || myEvents.length === 0) {
        setLoading(false)
        return
      }

      setEvents(myEvents)

      const eventIds = myEvents.map(e => e.id)
      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })

      if (mediaData) setMedias(mediaData)
      setLoading(false)
    }

    loadData()
  }, [])

  const eventsMap = useMemo(() => {
    const map: Record<string, Pick<Event, 'id' | 'name' | 'date'>> = {}
    events.forEach(e => { map[e.id] = e })
    return map
  }, [events])

  const filteredMedias = useMemo(() => {
    if (filter === 'all') return medias
    return medias.filter(m => m.type === filter)
  }, [medias, filter])

  const groupedByEvent = useMemo(() => {
    const groups: Record<string, Media[]> = {}
    filteredMedias.forEach(m => {
      if (!groups[m.event_id]) groups[m.event_id] = []
      groups[m.event_id].push(m)
    })
    // Preserve event order (by date desc)
    return events
      .filter(e => groups[e.id]?.length > 0)
      .map(e => ({ event: e, medias: groups[e.id] }))
  }, [filteredMedias, events])

  const totalPhotos = useMemo(() => medias.filter(m => m.type === 'photo').length, [medias])
  const totalVideos = useMemo(() => medias.filter(m => m.type === 'video').length, [medias])

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      })
      if (!res.ok) throw new Error('Falha ao deletar')
      setMedias(prev => prev.filter(m => m.id !== mediaId))
      setSelectedMedia(null)
    } catch (err) {
      console.error(err)
      alert('Erro ao deletar mídia.')
    }
  }

  const getPublicUrl = (path: string) =>
    supabase.storage.from('media').getPublicUrl(path).data.publicUrl

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0a0a0a]/20 border-t-[#0a0a0a] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-16"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>

        {medias.length > 0 && (
          <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-full p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'grouped'
                  ? 'bg-white text-[#0a0a0a] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers size={13} />
              Por evento
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#0a0a0a] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={13} />
              Cronológico
            </button>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-24 px-5 pb-36 max-w-5xl mx-auto w-full">

        {/* Title + stats */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <FolderHeart size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Minha pasta</h1>
            {medias.length > 0 ? (
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <ImageIcon size={12} />
                  {totalPhotos} {totalPhotos === 1 ? 'foto' : 'fotos'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Video size={12} />
                  {totalVideos} {totalVideos === 1 ? 'vídeo' : 'vídeos'}
                </span>
                <span className="text-gray-300">•</span>
                <span>{events.length} {events.length === 1 ? 'evento' : 'eventos'}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-0.5">Todas as mídias dos seus eventos, em um só lugar.</p>
            )}
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
          <>
            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6">
              {(['all', 'photo', 'video'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    filter === f
                      ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'photo' ? 'Fotos' : 'Vídeos'}
                </button>
              ))}
              {filter !== 'all' && (
                <span className="text-xs text-gray-400 ml-1">{filteredMedias.length} item{filteredMedias.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {filteredMedias.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
                <p className="text-gray-500 text-sm">Nenhum item encontrado para este filtro.</p>
              </div>
            ) : viewMode === 'grouped' ? (
              // Grouped by event
              <div className="flex flex-col gap-10">
                {groupedByEvent.map(({ event, medias: eventMedias }) => (
                  <section key={event.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-base font-bold text-[#0a0a0a] leading-tight">{event.name}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {event.date
                            ? new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : ''}
                          {' '}· {eventMedias.length} {eventMedias.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/${event.id}`)}
                        className="text-xs font-semibold text-gray-400 hover:text-[#0a0a0a] transition-colors"
                      >
                        Ver álbum →
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {eventMedias.map(media => {
                        const url = getPublicUrl(media.storage_path)
                        return (
                          <div
                            key={media.id}
                            className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm border border-black/5 bg-gray-100"
                            onClick={() => setSelectedMedia(media)}
                          >
                            {media.type === 'video' ? (
                              <>
                                <video src={`${url}#t=0.1`} className="w-full h-full object-cover" />
                                <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                                  <Video size={12} />
                                </div>
                              </>
                            ) : (
                              <img src={url} alt="Mídia" className="w-full h-full object-cover" loading="lazy" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              // Chronological masonry
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
                {filteredMedias.map(media => {
                  const url = getPublicUrl(media.storage_path)
                  const eventName = eventsMap[media.event_id]?.name || 'Evento'
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
                        <img src={url} alt="Mídia" className="w-full h-auto object-cover" loading="lazy" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-white text-xs font-semibold truncate">{eventName}</p>
                        <p className="text-white/80 text-[10px]">{new Date(media.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
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
