'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
      <main className="relative z-10 pt-24 pb-28 px-5 max-w-lg mx-auto">

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
        <div className="flex flex-col gap-4">
          {events.map(event => (
            <div
              key={event.id}
              className="rounded-[18px] overflow-hidden active:scale-[0.985] transition-transform duration-200"
              style={{
                background: 'rgba(255,255,255,0.93)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* Gradient accent band */}
              <div
                className="h-[3.5px] w-full"
                style={{ background: 'linear-gradient(90deg, #fdceb0 0%, #d0c0e8 100%)' }}
              />

              <div className="p-5 flex items-start gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink text-[15px] leading-snug mb-1 truncate">
                    {event.name}
                  </h3>
                  <p className="text-xs text-slate mb-4">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>

                  <div className="flex items-center gap-4">
                    <a
                      href={`/dashboard/${event.id}`}
                      target="_blank"
                      className="text-[13px] font-semibold text-ink border-b border-[#fdceb0] pb-0.5 hover:border-ink transition-colors"
                    >
                      Ver álbum
                    </a>
                    <button
                      onClick={() => router.push(`/dashboard/${event.id}/challenges`)}
                      className="text-[13px] font-semibold text-ink border-b border-[#d0c0e8] pb-0.5 hover:border-ink transition-colors cursor-pointer"
                    >
                      Desafios
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div
                  className="flex-shrink-0 rounded-xl p-1.5"
                  style={{ background: '#f3f3f3' }}
                >
                  <QRCodeGenerator slug={event.slug} />
                </div>
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
