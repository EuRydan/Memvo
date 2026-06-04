'use client'

import { use, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Media, Challenge } from '@/types'

export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const supabase = createClient()
  const [event, setEvent] = useState<{ id: string; name: string; date: string } | null>(null)
  const [medias, setMedias] = useState<Media[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [uploaderName, setUploaderName] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, date')
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (error || !data) { setNotFound(true); return }

      setEvent(data)
      loadMedias(data.id)
      loadChallenges(data.id)
      subscribeRealtime(data.id)
    }
    loadEvent()
  }, [slug])

  async function loadMedias(eventId: string) {
    const { data } = await supabase
      .from('media').select('*').eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (data) setMedias(data)
  }

  async function loadChallenges(eventId: string) {
    const { data } = await supabase
      .from('challenges').select('*').eq('event_id', eventId)
      .order('order_index')
    if (data) setChallenges(data)
  }

  function subscribeRealtime(eventId: string) {
    supabase.channel('media-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'media', filter: `event_id=eq.${eventId}` },
        (payload) => setMedias(prev => [payload.new as Media, ...prev])
      ).subscribe()
  }

  async function handleUpload(files: FileList | null, challengeId: string) {
    if (!files || !event) return
    setUploadingId(challengeId)

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: storageError } = await supabase.storage
        .from('media').upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (storageError) { console.error('Storage error:', storageError); continue }

      const isVideo = file.type.startsWith('video/')

      await supabase.from('media').insert({
        event_id: event.id,
        storage_path: fileName,
        uploader_name: uploaderName || null,
        type: isVideo ? 'video' : 'photo',
        challenge_id: challengeId,
      })
    }

    setUploadingId(null)
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  function mediasForChallenge(challengeId: string) {
    return medias.filter(m => m.challenge_id === challengeId)
  }

  function mediasWithoutChallenge() {
    return medias.filter(m => !m.challenge_id)
  }

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-warm">
      <div className="text-center bg-canvas border border-hairline p-8 max-w-sm">
        <p className="text-4xl mb-4">💔</p>
        <h1 className="text-xl font-normal tracking-[-0.5px] text-ink">Evento não encontrado</h1>
        <p className="text-sm text-slate mt-2">O link pode estar incorreto ou o evento foi encerrado pelo proprietário.</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-warm">
      <p className="text-slate text-sm">Carregando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas-warm">
      {/* Header */}
      <div className="bg-canvas border-b border-hairline px-6 py-8 text-center">
        <span className="text-[11px] font-medium tracking-[0.2px] text-stone uppercase block mb-1">Álbum Compartilhado</span>
        <h1 className="text-3xl font-normal tracking-[-0.9px] text-ink">{event.name}</h1>
        <p className="text-xs text-slate mt-1">
          {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Nome do convidado */}
        <div className="bg-canvas border border-hairline p-5 flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink uppercase tracking-[0.2px]">Seu Nome (Opcional)</label>
          <input
            type="text"
            placeholder="Ex: Maria Souza"
            value={uploaderName}
            onChange={e => setUploaderName(e.target.value)}
            className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
          />
        </div>

        {/* Desafios */}
        {challenges.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-ink uppercase tracking-[0.2px] px-1">🎯 Desafios Fotográficos</h2>

            {challenges.map((challenge, i) => {
              const photos = mediasForChallenge(challenge.id)
              const done = photos.length > 0
              const isUploading = uploadingId === challenge.id

              return (
                <div key={challenge.id} className="bg-canvas border border-hairline overflow-hidden transition">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${done ? 'bg-primary text-on-primary' : 'bg-canvas-warm text-slate border border-hairline'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <p className={`flex-1 text-sm ${done ? 'text-ink font-semibold' : 'text-graphite'}`}>
                      {challenge.title}
                    </p>
                    <input
                      ref={el => { fileRefs.current[challenge.id] = el }}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={e => handleUpload(e.target.files, challenge.id)}
                    />
                    <button
                      onClick={() => fileRefs.current[challenge.id]?.click()}
                      disabled={isUploading}
                      className={`text-xs px-4 py-2 rounded-full font-semibold transition cursor-pointer ${done ? 'bg-canvas border border-primary text-ink hover:bg-canvas-warm' : 'bg-primary text-on-primary hover:opacity-90'} disabled:opacity-50`}
                    >
                      {isUploading ? '⏳' : done ? '+ Foto' : '📷 Enviar'}
                    </button>
                  </div>

                  {/* Fotos do desafio */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 px-5 pb-5">
                      {photos.map(media => (
                        <div key={media.id} className="relative aspect-square rounded-none overflow-hidden bg-surface-cool border border-hairline">
                          {media.type === 'video' ? (
                            <video src={getPublicUrl(media.storage_path)} className="w-full h-full object-cover" />
                          ) : (
                            <img src={getPublicUrl(media.storage_path)} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Upload livre */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-[0.2px] px-1">📷 Envio Livre</h2>
          <div className="bg-canvas border border-hairline p-5 flex flex-col gap-4">
            <input
              id="free-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={e => handleUpload(e.target.files, '')}
            />
            <label
              htmlFor="free-upload"
              className={`w-full border-2 border-dashed border-hairline rounded-none py-8 flex flex-col items-center gap-2 hover:border-slate hover:bg-canvas-warm transition cursor-pointer ${uploadingId === '' ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="text-3xl">{uploadingId === '' ? '⏳' : '📷'}</span>
              <span className="text-sm text-slate">
                {uploadingId === '' ? 'Enviando...' : 'Toque para enviar fotos/vídeos livres'}
              </span>
            </label>

            {mediasWithoutChallenge().length > 0 && (
              <div className="grid grid-cols-3 gap-2 border-t border-hairline pt-4">
                {mediasWithoutChallenge().map(media => (
                  <div key={media.id} className="relative aspect-square rounded-none overflow-hidden bg-surface-cool border border-hairline">
                    {media.type === 'video' ? (
                      <video src={getPublicUrl(media.storage_path)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={getPublicUrl(media.storage_path)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progresso */}
        {challenges.length > 0 && (
          <p className="text-center text-xs text-slate font-medium">
            {medias.filter(m => m.challenge_id).length} de {challenges.length} desafios completados
          </p>
        )}
      </div>
    </div>
  )
}