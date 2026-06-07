'use client'

import { Logo } from '@/components/Logo'
import { TiltedDock } from '@/components/TiltedDock'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isEventActive } from '@/lib/limits'
import { Event } from '@/types'
import QRCodeGenerator from '@/components/QRCodeGenerator'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPlan, setHasPlan] = useState<boolean>(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [userRole, setUserRole] = useState<'host' | 'partner'>('host')
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
        .maybeSingle()

      if (!planData) {
        setHasPlan(false)
      }
      
      // Sempre carrega os eventos, mesmo se não tiver plano
      // para caso o usuário tenha eventos antigos ou para deixar a interface visível
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setEvents(data)
      
      // Guardar o papel do usuário no estado (host vs partner)
      setUserRole(user.user_metadata?.role || 'host')
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-stone">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">

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

      {/* ── Top App Bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-16"
        style={{
          background: 'rgba(250,250,250,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Left spacer for balance */}
        <div className="w-8" />

        {/* Logo */}
        <Logo className="h-6 w-auto text-ink" />

        {/* Right: sign out */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-hairline transition-colors text-slate hover:text-ink"
          title="Sair"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 pt-24 pb-28 px-6 max-w-3xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-stone uppercase mb-1">Painel</p>
            <h2
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              className="text-[1.9rem] font-bold tracking-[-0.02em] text-ink leading-tight"
            >
              Suas celebrações
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {userRole === 'partner' && (
              <button
                onClick={() => router.push('/parceiros')}
                className="hidden md:flex items-center gap-2 bg-stone-100 text-[#0a0a0a] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-stone-200 transition-all duration-200 cursor-pointer flex-shrink-0"
              >
                💼 Parceiros B2B
              </button>
            )}
            <button
              onClick={() => {
                if (hasPlan) router.push('/dashboard/new')
                else setShowUpgradeModal(true)
              }}
              className="bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0 relative overflow-hidden group"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Novo evento
                {!hasPlan && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">🔒</span>}
              </span>
              {!hasPlan && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
            </button>
          </div>
        </div>

        {/* Empty state */}
            {events.length === 0 && (
              <div
                className="rounded-2xl p-10 text-center"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <p className="text-3xl mb-3">🎉</p>
                <p className="text-sm font-semibold text-ink mb-1">Nenhum evento ainda</p>
                <p className="text-xs text-slate">Crie seu primeiro evento e compartilhe memórias.</p>
              </div>
            )}

            {/* Event Cards */}
            <div className="flex flex-wrap justify-center" style={{ gap: '48px' }}>
              {events.map(event => (
                <div
                  key={event.id}
                  className="flex flex-col items-center w-[280px] bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 p-5"
                >
                  {/* Image / QR Code Container (Gradient Border) */}
                  <div className="w-full aspect-square rounded-[24px] relative overflow-hidden mb-5 p-1.5 bg-gradient-to-br from-[#f4c5a8] to-[#d4bde8] shadow-sm">
                     <div className="w-full h-full rounded-[18px] overflow-hidden transition-transform hover:scale-105 duration-300">
                       {event.cover_url ? (
                         <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover" />
                       ) : (
                         <QRCodeGenerator slug={event.slug} eventName={event.name} eventDate={event.date} size={400} variant="cover" />
                       )}
                     </div>
                     {!isEventActive(event) && (
                       <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full text-stone-600 shadow-sm border border-black/5">
                         Arquivado
                       </div>
                     )}
                  </div>

                  {/* Text Info */}
                  <div className="flex flex-col items-center text-center px-2 w-full mb-4">
                     <h3 className="text-[17px] font-bold text-gray-900 leading-snug line-clamp-1 w-full truncate">
                       {event.name}
                     </h3>
                     <p className="text-[13px] text-gray-500 mt-1 font-medium">
                       {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                     </p>
                  </div>

                  {/* Stats & Actions */}
                  <div className="w-full grid grid-cols-2 gap-1 pt-3 border-t border-gray-100/80">
                     <button
                       onClick={() => {
                         if (hasPlan) router.push(`/dashboard/${event.id}`)
                         else setShowUpgradeModal(true)
                       }}
                       className="flex flex-col items-center justify-center p-2.5 rounded-[14px] hover:bg-gray-50 transition-colors group cursor-pointer"
                     >
                       <span className="text-[16px] font-bold text-gray-900 group-hover:text-black">
                         Álbum {!hasPlan && <span className="text-[10px] ml-1">🔒</span>}
                       </span>
                       <span className="text-[11px] text-gray-500 font-medium tracking-wide">Visualizar</span>
                     </button>
                     <button
                       onClick={() => {
                         if (hasPlan) router.push(`/dashboard/${event.id}/challenges`)
                         else setShowUpgradeModal(true)
                       }}
                       className="flex flex-col items-center justify-center p-2.5 rounded-[14px] hover:bg-gray-50 transition-colors group cursor-pointer"
                     >
                       <span className="text-[16px] font-bold text-gray-900 group-hover:text-black">
                         Desafios {!hasPlan && <span className="text-[10px] ml-1">🔒</span>}
                       </span>
                       <span className="text-[11px] text-gray-500 font-medium tracking-wide">Configurar</span>
                     </button>
                  </div>
                </div>
              ))}
            </div>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-stone hover:text-ink transition-colors p-2"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                Acesso Premium
              </h3>
              <p className="text-sm text-slate leading-relaxed px-2">
                Para criar novos eventos, gerenciar desafios e ter acesso completo ao álbum, você precisa de um plano ativo.
              </p>
            </div>

            <button
              onClick={() => router.push('/pricing')}
              className="w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
            >
              Ver planos e preços
            </button>
            <p className="text-xs text-stone text-center mt-4">
              Cancele a qualquer momento.
            </p>
          </div>
        </div>
      )}

      </main>

      {/* ── Bottom Nav Bar ── */}
      {/* ── Floating 3D Bottom Nav ── */}
      <TiltedDock />

    </div>
  )
}
