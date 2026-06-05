'use client'

import { use, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isEventActive } from '@/lib/limits'
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
  const freeUploadRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from('events').select('id, name, date').eq('slug', slug).eq('active', true).single()
      if (error || !data) { setNotFound(true); return }
      setEvent(data)
      loadMedias(data.id)
      loadChallenges(data.id)
      subscribeRealtime(data.id)
    }
    loadEvent()
  }, [slug])

  async function loadMedias(eventId: string) {
    const { data } = await supabase.from('media').select('*').eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (data) setMedias(data)
  }

  async function loadChallenges(eventId: string) {
    const { data } = await supabase.from('challenges').select('*').eq('event_id', eventId)
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
      if (storageError) { console.error(storageError); continue }
      const isVideo = file.type.startsWith('video/')
      await supabase.from('media').insert({
        event_id: event.id,
        storage_path: fileName,
        uploader_name: uploaderName || null,
        type: isVideo ? 'video' : 'photo',
        challenge_id: challengeId || null,
      })
    }
    setUploadingId(null)
  }

  function getPublicUrl(path: string) {
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  }

  function mediasForChallenge(cid: string) { return medias.filter(m => m.challenge_id === cid) }
  function mediasWithoutChallenge() { return medias.filter(m => !m.challenge_id) }

  const completedCount = challenges.filter(c => mediasForChallenge(c.id).length > 0).length
  const progress = challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0

  // ── Not found ──
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-5">
      <div
        className="text-center rounded-[20px] p-10 max-w-sm w-full"
        style={{ background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}
      >
        <p className="text-5xl mb-4">💔</p>
        <h1
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          className="text-xl font-bold text-ink mb-2"
        >
          Evento não encontrado
        </h1>
        <p className="text-sm text-slate">O link pode estar incorreto ou o evento foi encerrado.</p>
      </div>
    </div>
  )

  // ── Loading ──
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">

      {/* ── Hero ── */}
      <div
        className="relative w-full pt-16 pb-10 px-5 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #f4c5a8 0%, #d4bde8 55%, #b8d4f0 100%)',
        }}
      >
        {/* Orb */}
        <div
          className="absolute top-[-60px] left-[50%] -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <p className="relative text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase mb-3">
          Álbum compartilhado
        </p>
        <h1
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          className="relative text-[2.2rem] font-bold tracking-[-0.02em] text-white leading-tight mb-2"
        >
          {event.name}
        </h1>
        <p className="relative text-sm text-white/75">
          {new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-5 pb-12 flex flex-col gap-5 -mt-4 relative z-10">

        {/* ── Archived Banner ── */}
        {!isEventActive(event) && (
          <div className="rounded-[16px] px-5 py-4 bg-orange-50 border border-orange-100 flex flex-col items-center text-center gap-2" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <span className="text-2xl">📦</span>
            <p className="text-sm font-semibold text-orange-800">Este evento foi arquivado</p>
            <p className="text-xs text-orange-700">Ainda é possível reviver os momentos abaixo, mas o envio de novas fotos está desativado.</p>
          </div>
        )}

        {/* ── Progress bar ── */}
        {challenges.length > 0 && (
          <div
            className="rounded-[16px] px-5 py-4"
            style={{ background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink">
                {completedCount} de {challenges.length} desafios fotografados
              </span>
              {completedCount === challenges.length && completedCount > 0 && (
                <span className="text-xs font-semibold text-[#2d8a32]">Completo! ✓</span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #4ac550, #22c55e)',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Name input ── */}
        {isEventActive(event) && (
          <div
            className="rounded-[18px] px-5 py-4 flex items-center gap-3"
            style={{ background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <svg width="16" height="16" fill="none" stroke="#939393" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              type="text"
              placeholder="Seu nome (opcional)"
              value={uploaderName}
              onChange={e => setUploaderName(e.target.value)}
              className="flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-stone"
            />
          </div>
        )}

        {/* ── Challenges ── */}
        {challenges.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              className="text-[1.1rem] font-bold text-ink px-1 flex items-center gap-2"
            >
              🎯 Desafios Fotográficos
            </h2>

            {challenges.map((challenge, i) => {
              const photos = mediasForChallenge(challenge.id)
              const done = photos.length > 0
              const isUploading = uploadingId === challenge.id

              return (
                <div
                  key={challenge.id}
                  className="rounded-[18px] overflow-hidden"
                  style={{
                    background: '#fff',
                    boxShadow: done
                      ? '0 4px 20px rgba(74,197,80,0.12)'
                      : '0 4px 20px rgba(0,0,0,0.05)',
                    border: done ? '1.5px solid rgba(74,197,80,0.3)' : '1.5px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Index circle */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all"
                      style={done
                        ? { background: '#4ac550', color: '#fff' }
                        : { background: '#f3f3f3', color: '#939393', border: '1.5px solid #e0e0e0' }
                      }
                    >
                      {done ? (
                        <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : i + 1}
                    </div>

                    {/* Challenge text */}
                    <p className={`flex-1 text-sm leading-snug ${done ? 'text-ink font-medium' : 'text-graphite'}`}>
                      {challenge.title}
                    </p>

                    {/* Hidden file input */}
                    <input
                      ref={el => { fileRefs.current[challenge.id] = el }}
                      type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => handleUpload(e.target.files, challenge.id)}
                    />

                    {/* Upload button */}
                    {isEventActive(event) && (
                      <button
                        onClick={() => fileRefs.current[challenge.id]?.click()}
                        disabled={isUploading}
                        className="text-xs px-4 py-2 rounded-full font-semibold transition cursor-pointer flex-shrink-0 disabled:opacity-50"
                        style={done
                          ? { background: '#f3f3f3', color: '#0a0a0a', border: '1.5px solid #e0e0e0' }
                          : { background: '#0a0a0a', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }
                        }
                      >
                        {isUploading ? (
                          <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : done ? '+ Foto' : '📷 Fotografar'}
                      </button>
                    )}
                  </div>

                  {/* Photos grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5 px-5 pb-5">
                      {photos.map(media => (
                        <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3f3f3]">
                          {media.type === 'video'
                            ? <video src={getPublicUrl(media.storage_path)} className="w-full h-full object-cover" />
                            : <img src={getPublicUrl(media.storage_path)} alt="" className="w-full h-full object-cover" />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}