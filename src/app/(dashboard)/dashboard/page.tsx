'use client'

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

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setEvents(data)
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
        <h1
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          className="text-[1.4rem] font-bold tracking-[-0.02em] text-ink"
        >
          Memvo
        </h1>

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
          <button
            onClick={() => router.push('/dashboard/new')}
            className="bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
          >
            Novo evento
          </button>
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
                   <QRCodeGenerator slug={event.slug} size={400} variant="cover" />
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
                   onClick={() => window.open(`/dashboard/${event.id}`, '_blank')}
                   className="flex flex-col items-center justify-center p-2.5 rounded-[14px] hover:bg-gray-50 transition-colors group cursor-pointer"
                 >
                   <span className="text-[16px] font-bold text-gray-900 group-hover:text-black">Álbum</span>
                   <span className="text-[11px] text-gray-500 font-medium tracking-wide">Visualizar</span>
                 </button>
                 <button
                   onClick={() => router.push(`/dashboard/${event.id}/challenges`)}
                   className="flex flex-col items-center justify-center p-2.5 rounded-[14px] hover:bg-gray-50 transition-colors group cursor-pointer"
                 >
                   <span className="text-[16px] font-bold text-gray-900 group-hover:text-black">Desafios</span>
                   <span className="text-[11px] text-gray-500 font-medium tracking-wide">Configurar</span>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Bottom Nav Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pt-3 pb-5"
        style={{
          background: 'rgba(250,250,250,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Eventos (active) */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex flex-col items-center gap-1 text-ink active:scale-90 transition-transform duration-200"
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Eventos</span>
        </button>

        {/* Novo evento (FAB center) */}
        <button
          onClick={() => router.push('/dashboard/new')}
          className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center -mt-5 shadow-lg hover:opacity-85 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.22)' }}
          title="Novo Evento"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Sair */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          className="flex flex-col items-center gap-1 text-slate hover:text-ink transition-colors active:scale-90 duration-200 cursor-pointer"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Sair</span>
        </button>
      </nav>

    </div>
  )
}
