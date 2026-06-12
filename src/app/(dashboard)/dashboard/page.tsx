'use client'

import { Logo } from '@/components/Logo'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isEventActive, countActiveEvents, PLAN_LIMITS, PlanTier, isEventLocked } from '@/lib/limits'
import { Event } from '@/types'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { useTranslation } from '@/contexts/I18nContext'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [planId, setPlanId] = useState<string>('none')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [uploadingCoverFor, setUploadingCoverFor] = useState<string | null>(null)

  const [mediaStats, setMediaStats] = useState<Record<string, { photos: number, guests: number }>>({})
  const [shareModalEvent, setShareModalEvent] = useState<Event | null>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)

  // Mouse parallax for orbs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth <= 768) return
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) * 0.008
      const dy = (e.clientY - cy) * 0.008
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${dx}px, ${dy}px)`
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${-dx}px, ${-dy}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (planData) {
        setPlanId(planData.plan_id || 'none')
      }
      
      // Sempre carrega os eventos, mesmo se não tiver plano
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setEvents(data)
        
        // Buscar estatísticas de fotos
        if (data.length > 0) {
          const { data: medias } = await supabase
            .from('media')
            .select('event_id, guest_id, uploader_name')
            .in('event_id', data.map(e => e.id))
            .limit(10000)
            
          if (medias) {
            const stats: Record<string, { photos: number, guests: number }> = {}
            data.forEach(e => {
              const eventMedias = medias.filter(m => m.event_id === e.id)
              const uniqueGuests = new Set(eventMedias.map(m => m.guest_id || m.uploader_name || 'unknown')).size
              stats[e.id] = { photos: eventMedias.length, guests: uniqueGuests }
            })
            setMediaStats(stats)
          }
        }
      }
      

      setLoading(false)
    }
    load()
  }, [])

  async function handleUploadCover(eventId: string, file?: File | null) {
    if (!file) return
    setUploadingCoverFor(eventId)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: storageError, data: storageData } = await supabase.storage
        .from('media').upload(fileName, file, { cacheControl: '3600', upsert: false })
        
      if (storageError) throw storageError
      
      const coverUrl = supabase.storage.from('media').getPublicUrl(storageData.path).data.publicUrl
      
      const { error: updateError } = await supabase
        .from('events')
        .update({ cover_url: coverUrl })
        .eq('id', eventId)
        
      if (updateError) throw updateError
      
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, cover_url: coverUrl } : e))
    } catch (err) {
      console.error('Error uploading cover:', err)
      alert(t('mainDashboard.uploadCoverError') || 'Erro ao enviar capa.')
    } finally {
      setUploadingCoverFor(null)
    }
  }

  // Helper to format plan name
  const planNames: Record<string, string> = {
    freemium: 'Free',
    essential: 'Essential',
    classic: 'Classic',
    premium: 'Premium'
  }
  
  const displayPlanName = planNames[planId] || t('mainDashboard.none')
  const draftEventId = events.find(e => e.status === 'draft' && !e.active)?.id
  const showBanner = draftEventId && planId === 'none'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-stone">{t('mainDashboard.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden transition-colors duration-200">

      {/* Background Orbs */}
      <div
        ref={orb1Ref}
        className="fixed top-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(253,206,176,0.5) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        ref={orb2Ref}
        className="fixed top-[80px] right-[-80px] w-[280px] h-[280px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(208,192,232,0.45) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Main Content ── */}
      <main className="relative z-10 pt-10 pb-16 px-6 max-w-3xl mx-auto">
      
        {/* Payment Banner */}
        {showBanner && (
          <div className="mb-8 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 transition-colors duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                <span className="text-orange-600 dark:text-orange-400 text-lg">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-300">{t('mainDashboard.completePurchase')}</h3>
                <p className="text-xs text-orange-700 dark:text-orange-400/80 mt-0.5">{t('mainDashboard.completePurchaseDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/pricing?eventId=${draftEventId}`)}
              className="bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-700 active:scale-95 transition-all shrink-0 whitespace-nowrap"
            >
              {t('mainDashboard.viewPlans')}
            </button>
          </div>
        )}

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-stone uppercase mb-1">{t('mainDashboard.panel')}</p>
            <h2
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              className="text-[1.9rem] font-bold tracking-[-0.02em] text-ink leading-tight transition-colors duration-200"
            >
              {t('mainDashboard.yourCelebrations')}
            </h2>
            {planId !== 'none' && (
              <p className="text-xs font-medium text-slate mt-1.5 flex items-center gap-1.5 transition-colors duration-200">
                {t('mainDashboard.planPrefix')} {displayPlanName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push('/onboarding?new=true')}
              className="bg-ink text-canvas text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0 relative overflow-hidden group border border-hairline"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('mainDashboard.newEvent')}
              </span>
            </button>
          </div>
        </div>

        {/* Empty state */}
            {events.length === 0 && (
              <div
                className="rounded-2xl p-10 text-center bg-canvas-warm/80 border border-hairline transition-colors duration-200"
                style={{
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <p className="text-3xl mb-3">🎉</p>
                <p className="text-sm font-semibold text-ink mb-1 transition-colors duration-200">{t('mainDashboard.noEvents')}</p>
                <p className="text-xs text-slate mb-5 transition-colors duration-200">{t('mainDashboard.noEventsDesc')}</p>
                <button
                  onClick={() => router.push('/onboarding?new=true')}
                  className="bg-ink text-canvas text-sm font-semibold px-6 py-2.5 rounded-full hover:opacity-85 transition-opacity"
                >
                  {t('mainDashboard.createFirstEvent')}
                </button>
              </div>
            )}

            {/* Event Cards */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12">
              {events.map(event => (
                <div
                  key={event.id}
                  className="flex flex-col xl:flex-row items-stretch w-full max-w-5xl bg-canvas-warm rounded-[24px] overflow-hidden border border-hairline shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Left: Image Box */}
                  <div className="relative w-full xl:w-[300px] h-[220px] xl:h-auto shrink-0 p-3">
                    <div className="w-full h-full rounded-[16px] overflow-hidden bg-ink/5 flex flex-col items-center justify-center relative">
                      {event.cover_url ? (
                         <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                      ) : (
                         <label className={`text-center p-4 flex flex-col items-center justify-center h-full w-full ${uploadingCoverFor === event.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-ink/5 transition-colors rounded-[16px]'}`}>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              disabled={uploadingCoverFor === event.id}
                              onChange={(e) => handleUploadCover(event.id, e.target.files?.[0])}
                            />
                            {uploadingCoverFor === event.id ? (
                               <svg className="animate-spin text-slate mb-2" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                               </svg>
                            ) : (
                               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-slate mb-2 opacity-60">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                               </svg>
                            )}
                            <p className="text-xs text-slate font-medium opacity-80">
                               {uploadingCoverFor === event.id ? (t('mainDashboard.uploadingCover') || 'Enviando...') : t('mainDashboard.uploadCover')}
                            </p>
                         </label>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1">
                        {isEventLocked(event.id, events, planId) ? (
                          <div className="bg-canvas text-ink text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {t('mainDashboard.pendingPayment')}
                          </div>
                        ) : new Date(event.date + 'T12:00:00') > new Date() ? (
                          <div className="bg-canvas text-ink text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {t('mainDashboard.comingSoon')}
                          </div>
                        ) : isEventActive(event) ? (
                          <div className="bg-canvas text-ink text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {t('mainDashboard.active')}
                          </div>
                        ) : (
                          <div className="bg-canvas text-ink text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {t('mainDashboard.archived')}
                          </div>
                        )}
                      </div>
                      
                      {/* Right Action */}
                      <div className="absolute top-4 right-4">
                        <button className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                           <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex flex-col justify-center px-6 py-5 xl:py-8 w-full xl:w-[280px] shrink-0 border-b xl:border-b-0 xl:border-r border-hairline">
                     <h3 className="text-2xl font-bold text-ink leading-tight mb-4 transition-colors duration-200">
                       {event.name}
                     </h3>
                     <p className="text-[13px] text-slate font-medium transition-colors duration-200">
                       {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                     </p>
                     {mediaStats[event.id] && (
                       <p className="text-[11px] text-stone font-semibold mt-1 transition-colors duration-200">
                         {mediaStats[event.id].photos} {t('mainDashboard.photos')} <span className="mx-1">•</span> {mediaStats[event.id].guests} {t('mainDashboard.guests')}
                       </p>
                     )}
                  </div>

                  {/* Right: Actions */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 w-full xl:flex-1">
                    {isEventLocked(event.id, events, planId) ? (
                      <div className="flex flex-col items-center justify-center w-full p-6 bg-red-50 dark:bg-red-500/10 transition-colors col-span-2 xl:col-span-4">
                         <button
                           onClick={() => router.push(`/pricing?eventId=${event.id}`)}
                           className="text-red-600 dark:text-red-400 font-bold text-sm flex items-center gap-2"
                         >
                           🔒 {t('mainDashboard.unlockEvent')}
                         </button>
                      </div>
                    ) : (
                      <>
                        {/* Action 1 */}
                        <div 
                          onClick={() => setShareModalEvent(event)}
                          className="flex flex-col items-center justify-center py-6 border-r border-b xl:border-b-0 border-hairline hover:bg-ink/5 cursor-pointer transition-colors group overflow-hidden"
                        >
                           <span className="text-sm font-semibold text-ink mb-1 group-hover:scale-105 transition-transform truncate w-full text-center px-2">QR</span>
                           <span className="text-[11px] sm:text-xs text-stone truncate w-full text-center px-2">{t('mainDashboard.share')}</span>
                        </div>
                        {/* Action 2 */}
                        <div 
                          onClick={() => router.push(`/dashboard/${event.id}`)}
                          className="flex flex-col items-center justify-center py-6 border-b xl:border-b-0 xl:border-r border-hairline hover:bg-ink/5 cursor-pointer transition-colors group overflow-hidden"
                        >
                           <span className="text-sm font-semibold text-ink mb-1 uppercase group-hover:scale-105 transition-transform truncate w-full text-center px-2">{t('mainDashboard.album')}</span>
                           <span className="text-[11px] sm:text-xs text-stone truncate w-full text-center px-2">{t('mainDashboard.view')}</span>
                        </div>
                        {/* Action 3 */}
                        <div 
                          onClick={() => router.push(`/dashboard/${event.id}/challenges`)}
                          className="flex flex-col items-center justify-center py-6 border-r xl:border-r border-hairline hover:bg-ink/5 cursor-pointer transition-colors group overflow-hidden"
                        >
                           <span className="text-sm font-semibold text-ink mb-1 uppercase group-hover:scale-105 transition-transform truncate w-full text-center px-2">{t('mainDashboard.missions')}</span>
                           <span className="text-[11px] sm:text-xs text-stone truncate w-full text-center px-2">{t('mainDashboard.challenges')}</span>
                        </div>
                        {/* Action 4 */}
                        <div 
                          onClick={() => router.push(`/dashboard/${event.id}/stats`)}
                          className="flex flex-col items-center justify-center py-6 hover:bg-ink/5 cursor-pointer transition-colors group overflow-hidden"
                        >
                           <span className="text-sm font-semibold text-ink mb-1 uppercase group-hover:scale-105 transition-transform truncate w-full text-center px-2">{t('mainDashboard.stats')}</span>
                           <span className="text-[11px] sm:text-xs text-stone truncate w-full text-center px-2">{t('mainDashboard.stats')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative bg-canvas-warm border border-hairline rounded-[2rem] p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 transition-colors duration-200">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-stone hover:text-ink transition-colors p-2"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2 transition-colors" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {t('mainDashboard.premiumAccess')}
              </h3>
              <p className="text-sm text-slate leading-relaxed px-2 transition-colors">
                {t('mainDashboard.premiumDesc')}
              </p>
            </div>

            <button
              onClick={() => {
                setShowUpgradeModal(false);
                router.push('/dashboard');
              }}
              className="w-full bg-ink text-canvas font-semibold py-3.5 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
            >
              {t('mainDashboard.goToPanel')}
            </button>
            <p className="text-xs text-stone text-center mt-4 transition-colors">
              {t('mainDashboard.cancelAnytime')}
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShareModalEvent(null)} />
          <div className="relative bg-canvas-warm border border-hairline rounded-[2rem] p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 flex flex-col items-center transition-colors duration-200">
            <button 
              onClick={() => setShareModalEvent(null)}
              className="absolute top-4 right-4 text-stone hover:text-ink transition-colors p-2"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-ink mb-6 text-center transition-colors" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {t('mainDashboard.shareEvent')}
            </h3>
            
            <div className="w-48 h-48 rounded-[24px] overflow-hidden mb-6 p-2 bg-gradient-to-br from-[#f4c5a8] to-[#d4bde8] shadow-sm">
              <div className="w-full h-full rounded-[18px] overflow-hidden bg-white">
                <QRCodeGenerator slug={shareModalEvent.slug} eventName={shareModalEvent.name} eventDate={shareModalEvent.date} size={250} variant="cover" />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const link = `https://memvor.app/e/${shareModalEvent.slug}`
                  navigator.clipboard.writeText(link)
                  alert(t('mainDashboard.linkCopied'))
                }}
                className="w-full bg-ink/5 text-ink font-semibold py-3.5 rounded-full hover:bg-ink/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                {t('mainDashboard.copyEventLink')}
              </button>
            </div>
            
            <p className="text-xs text-stone text-center mt-6 transition-colors">
              {t('mainDashboard.shareDesc')}
            </p>
          </div>
        </div>
      )}

      </main>
    </div>
  )
}
