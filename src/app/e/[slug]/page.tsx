'use client'

import { use, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isEventActive, isEventLocked, UserPlanRecord, MAX_PHOTO_SIZE, MAX_VIDEO_SIZE, getVideoDurationLimit, resolveEventPlanId } from '@/lib/limits'
import { Media, Challenge } from '@/types'
import StoryCamera from '@/components/StoryCamera'
import MediaViewer from '@/components/MediaViewer'

export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const supabase = createClient()
  const [event, setEvent] = useState<{ id: string; name: string; date: string; active: boolean; theme_color?: string; welcome_message?: string } | null>(null)
  const [medias, setMedias] = useState<Media[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [uploaderName, setUploaderName] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [activeChallengeId, setActiveChallengeId] = useState<string>('')
  const [tappedMediaId, setTappedMediaId] = useState<string | null>(null)
  const [viewingMedia, setViewingMedia] = useState<Media | null>(null)
  const [myUploads, setMyUploads] = useState<string[]>([])
  const [notFound, setNotFound] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [planType, setPlanType] = useState<string>('none')
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const freeUploadRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from('events').select('id, name, date, active, owner_id, status, theme_color, welcome_message').eq('slug', slug).eq('active', true).single()
      if (error || !data) { setNotFound(true); return }
      setEvent(data)

      // Fetch owner plans (all records, to check per-event lock)
      const { data: ownerPlansData } = await supabase
        .from('user_plans')
        .select('event_id, plan_id')
        .eq('user_id', data.owner_id)

      const ownerPlans: UserPlanRecord[] = (ownerPlansData || []) as UserPlanRecord[]

      const plan = resolveEventPlanId(ownerPlans, data.id)
      setPlanType(plan)

      if (isEventLocked(data.id, ownerPlans, data)) {
        setIsLocked(true)
        return
      }

      loadMedias(data.id)
      loadChallenges(data.id)
      subscribeRealtime(data.id)
      
      const stored = localStorage.getItem('memvor_uploads')
      if (stored) {
        setMyUploads(JSON.parse(stored))
      }
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
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'media', filter: `event_id=eq.${eventId}` },
        (payload) => setMedias(prev => prev.filter(m => m.id !== payload.old.id))
      )
      .subscribe()
  }

  async function handleUpload(files: FileList | null, challengeId: string) {
    if (!files || !event) return
    setUploadingId(challengeId)

    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
    const allowedVideoMimes = ['video/mp4', 'video/quicktime', 'video/webm']

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/')
      
      // Validação de MIME type e Tamanho
      if (isVideo) {
        const durationLimit = getVideoDurationLimit(planType)
        if (durationLimit === 0) {
          alert('Envio de vídeos é exclusivo dos planos Clássico e Premium.')
          continue
        }

        if (!allowedVideoMimes.includes(file.type)) {
          alert(`Formato de vídeo não suportado: ${file.name}. Use MP4, MOV ou WebM.`)
          continue
        }
        if (file.size > MAX_VIDEO_SIZE) {
          alert(`O vídeo ${file.name} excede o limite de ${MAX_VIDEO_SIZE / (1024 * 1024)}MB.`)
          continue
        }

        // Validação de duração
        try {
          const duration = await new Promise<number>((resolve, reject) => {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => resolve(video.duration)
            video.onerror = () => reject('Error loading video')
            video.src = URL.createObjectURL(file)
          })
          
          if (duration > durationLimit) {
            alert(`O vídeo tem ${Math.round(duration)}s. O limite do seu plano é de ${durationLimit}s.`)
            continue
          }
        } catch (e) {
          console.warn('Could not read video duration', e)
        }

      } else {
        if (!allowedImageMimes.includes(file.type)) {
          alert(`Formato de imagem não suportado: ${file.name}. Use JPG, PNG, WEBP ou HEIC.`)
          continue
        }
        if (file.size > MAX_PHOTO_SIZE) {
          alert(`A imagem ${file.name} excede o limite de 10MB.`)
          continue
        }
      }

      const ext = file.name.split('.').pop()
      
      // 1. Obter URL pré-assinada
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          file_ext: ext,
          file_size: file.size,
          challenge_id: challengeId || null
        })
      })
      
      const presignData = await presignRes.json()
      
      if (!presignRes.ok) {
        alert(presignData.error || 'Erro de permissão para envio. Você pode ter atingido o limite.')
        continue
      }
      
      // 2. Upload direto usando a URL assinada
      const { token, path } = presignData
      const { error: storageError } = await supabase.storage
        .from('media')
        .uploadToSignedUrl(path, token, file, { cacheControl: '3600', upsert: false })
        
      if (storageError) {
        console.error('Storage Upload Error:', storageError)
        continue
      }
      
      // 3. Confirmar a criação no banco de dados
      const res = await fetch('/api/media/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          storage_path: path,
          uploader_name: uploaderName || null,
          type: isVideo ? 'video' : 'photo',
          challenge_id: challengeId || null,
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || 'Erro ao enviar mídia. Você pode ter atingido o limite do seu plano.')
        continue
      }
      
      const newMedia = data.media
      
      if (newMedia) {
        const updatedUploads = [...myUploads, newMedia.id]
        setMyUploads(updatedUploads)
        localStorage.setItem('memvor_uploads', JSON.stringify(updatedUploads))
      }
    }
    setUploadingId(null)
  }

  function handleCameraCapture(file: File) {
    // Create a FileList-like object
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    handleUpload(dataTransfer.files, activeChallengeId)
  }

  async function handleDeleteMedia(mediaId: string) {
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId })
      })
      if (!res.ok) throw new Error('Failed to delete')
      
      setViewingMedia(null)
      setTappedMediaId(null)
      setMedias(prev => prev.filter(m => m.id !== mediaId))
      
      const updatedUploads = myUploads.filter(id => id !== mediaId)
      setMyUploads(updatedUploads)
      localStorage.setItem('memvor_uploads', JSON.stringify(updatedUploads))
    } catch (err) {
      console.error('Delete error', err)
      alert('Erro ao apagar a mídia.')
    }
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
        className="text-center rounded-card-lg p-10 max-w-sm w-full shadow-float"
        style={{ background: '#fff' }}
      >
        <p className="text-5xl mb-4">💔</p>
        <h1
          className="text-xl font-bold text-ink mb-2 font-serif"
        >
          Evento não encontrado
        </h1>
        <p className="text-sm text-slate">O link pode estar incorreto ou o evento foi encerrado.</p>
      </div>
    </div>
  )

  // ── Locked ──
  if (isLocked) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-5">
      <div
        className="text-center rounded-card-lg p-10 max-w-sm w-full shadow-float"
        style={{ background: '#fff' }}
      >
        <p className="text-5xl mb-4">🚧</p>
        <h1
          className="text-xl font-bold text-ink mb-2 font-serif"
        >
          Evento não ativado
        </h1>
        <p className="text-sm text-slate">O anfitrião precisa concluir a configuração no painel para receber fotos.</p>
      </div>
    </div>
  )

  // ── Draft ──
  if (event && !event.active) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-5">
      <div
        className="text-center rounded-card-lg p-10 max-w-sm w-full shadow-float"
        style={{ background: '#fff' }}
      >
        <p className="text-5xl mb-4">💳</p>
        <h1
          className="text-xl font-bold text-ink mb-2 font-serif"
        >
          Aguardando Pagamento
        </h1>
        <p className="text-sm text-slate">O anfitrião está finalizando a ativação deste evento.</p>
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
          className="relative text-[2.2rem] font-bold tracking-[-0.02em] text-white leading-tight mb-2 font-serif"
        >
          {event.name}
        </h1>
        <p className="relative text-sm text-white/75 mb-4">
          {new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
        
        {event.welcome_message && (
          <div className="relative text-sm text-white/90 font-medium italic mt-2 px-4 max-w-sm mx-auto drop-shadow-sm">
            "{event.welcome_message}"
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-5 pb-12 flex flex-col gap-5 -mt-4 relative z-10">

        {/* ── Archived Banner ── */}
        {!isEventActive(event) && (
          <div className="rounded-2xl px-5 py-4 bg-orange-50 border border-orange-100 flex flex-col items-center text-center gap-2 shadow-card">
            <span className="text-2xl">📦</span>
            <p className="text-sm font-semibold text-orange-800">Este evento foi arquivado</p>
            <p className="text-xs text-orange-700">Ainda é possível reviver os momentos abaixo, mas o envio de novas fotos está desativado.</p>
          </div>
        )}

        {/* ── Progress bar ── */}
        {challenges.length > 0 && (
          <div
            className="rounded-2xl px-5 py-4 shadow-card"
            style={{ background: '#fff' }}
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
                  background: event.theme_color || '#4ac550',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Name input ── */}
        {isEventActive(event) && (
          <div
            className="rounded-card px-5 py-4 flex items-center gap-3 shadow-card"
            style={{ background: '#fff' }}
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
              className="text-[1.1rem] font-bold text-ink px-1 flex items-center gap-2 font-serif"
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
                  className="rounded-card overflow-hidden"
                  style={{
                    background: '#fff',
                    boxShadow: done
                      ? `0 4px 20px ${event.theme_color ? event.theme_color + '25' : 'rgba(74,197,80,0.12)'}`
                      : '0 4px 20px rgba(0,0,0,0.05)',
                    border: done ? `1.5px solid ${event.theme_color ? event.theme_color + '40' : 'rgba(74,197,80,0.3)'}` : '1.5px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Index circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all"
                      style={done
                        ? { background: event.theme_color || '#4ac550', color: '#fff' }
                        : { background: '#f3f3f3', color: '#676f7b', border: '1.5px solid #e0e0e0' }
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

                    {/* Hidden file input for Gallery */}
                    <input
                      ref={el => { fileRefs.current[challenge.id] = el }}
                      type="file" accept="image/*,video/*" className="hidden"
                      onChange={e => handleUpload(e.target.files, challenge.id)}
                    />

                    {/* Upload Buttons */}
                    {isEventActive(event) && (
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex gap-2">
                          {/* Gallery Button */}
                          <button
                            onClick={() => fileRefs.current[challenge.id]?.click()}
                            disabled={isUploading || ((planType === 'freemium' || planType === 'essential') && photos.filter(m => myUploads.includes(m.id)).length >= (planType === 'freemium' ? 1 : 3))}
                            title="Enviar da galeria"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50 disabled:bg-gray-200"
                            style={{ background: '#f3f3f3', color: '#0a0a0a' }}
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </button>
                          
                          {/* Camera Button */}
                          <button
                            onClick={() => {
                              setActiveChallengeId(challenge.id)
                              setIsCameraOpen(true)
                            }}
                            disabled={isUploading || ((planType === 'freemium' || planType === 'essential') && photos.filter(m => myUploads.includes(m.id)).length >= (planType === 'freemium' ? 1 : 3))}
                            className="text-xs px-4 py-2 h-10 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-transparent disabled:shadow-none"
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
                            ) : (
                              <>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-2h8l2 2h3v12H3V7zm5 6a4 4 0 108 0 4 4 0 00-8 0z" />
                                </svg>
                                {done ? 'Nova' : 'Câmera'}
                              </>
                            )}
                          </button>
                        </div>
                        {(planType === 'freemium' || planType === 'essential') && photos.filter(m => myUploads.includes(m.id)).length >= (planType === 'freemium' ? 1 : 3) && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Limite Atingido</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Photos grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 px-5 pb-5">
                      {photos.map(media => {
                        const isMine = myUploads.includes(media.id)
                        const isTapped = tappedMediaId === media.id

                        return (
                          <div 
                            key={media.id} 
                            onClick={() => {
                              if (!isMine) {
                                // If not mine, just open full screen immediately
                                setViewingMedia(media)
                              } else if (isTapped) {
                                setViewingMedia(media)
                              } else {
                                setTappedMediaId(media.id)
                              }
                            }}
                            className="relative aspect-square rounded-xl overflow-hidden bg-[#f3f3f3] cursor-pointer"
                          >
                            {media.type === 'video'
                              ? <video src={getPublicUrl(media.storage_path)} className="w-full h-full object-cover pointer-events-none" />
                              : <img src={getPublicUrl(media.storage_path)} alt="" className="w-full h-full object-cover pointer-events-none" />
                            }
                            
                            {/* Tap Overlay with Trash Icon */}
                            {isTapped && isMine && (
                              <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-2 transition-all">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteMedia(media.id)
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg active:scale-90 transition"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Free Album (Premium Only) ── */}
        {planType === 'premium' && (
          <div className="flex flex-col gap-3 mt-4">
            <h2
              className="text-[1.1rem] font-bold text-ink px-1 flex items-center gap-2 font-serif"
            >
              📸 Álbum Livre
            </h2>

            <div
              className="rounded-card overflow-hidden shadow-card"
              style={{
                background: '#fff',
                border: '1.5px solid transparent',
              }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <p className="flex-1 text-sm leading-snug text-graphite">
                  Tire fotos à vontade sem regras!
                </p>

                <input
                  ref={freeUploadRef}
                  type="file" accept="image/*,video/*" className="hidden"
                  onChange={e => handleUpload(e.target.files, '')}
                />

                {isEventActive(event) && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => freeUploadRef.current?.click()}
                      disabled={uploadingId === ''}
                      title="Enviar da galeria"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50"
                      style={{ background: '#f3f3f3', color: '#0a0a0a' }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveChallengeId('')
                        setIsCameraOpen(true)
                      }}
                      disabled={uploadingId === ''}
                      className="text-xs px-4 py-2 h-10 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      style={{ background: '#0a0a0a', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
                    >
                      {uploadingId === '' ? (
                        <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-2h8l2 2h3v12H3V7zm5 6a4 4 0 108 0 4 4 0 00-8 0z" />
                          </svg>
                          Câmera
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {mediasWithoutChallenge().length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 px-5 pb-5">
                  {mediasWithoutChallenge().map(media => {
                    const isMine = myUploads.includes(media.id)
                    const isTapped = tappedMediaId === media.id

                    return (
                      <div 
                        key={media.id} 
                        onClick={() => {
                          if (!isMine) {
                            setViewingMedia(media)
                          } else if (isTapped) {
                            setViewingMedia(media)
                          } else {
                            setTappedMediaId(media.id)
                          }
                        }}
                        className="relative aspect-square rounded-xl overflow-hidden bg-[#f3f3f3] cursor-pointer"
                      >
                        {media.type === 'video'
                          ? <video src={getPublicUrl(media.storage_path)} className="w-full h-full object-cover pointer-events-none" />
                          : <img src={getPublicUrl(media.storage_path)} alt="" className="w-full h-full object-cover pointer-events-none" />
                        }
                        
                        {isTapped && isMine && (
                          <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-2 transition-all">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMedia(media.id)
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg active:scale-90 transition"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {isCameraOpen && (
        <StoryCamera 
          onClose={() => setIsCameraOpen(false)} 
          onCapture={handleCameraCapture} 
        />
      )}

      {viewingMedia && (
        <MediaViewer
          media={viewingMedia}
          publicUrl={getPublicUrl(viewingMedia.storage_path)}
          onClose={() => setViewingMedia(null)}
          onDelete={() => handleDeleteMedia(viewingMedia.id)}
          canDelete={myUploads.includes(viewingMedia.id)}
        />
      )}
    </div>
  )
}