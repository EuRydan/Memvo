"use client"

import Link from "next/link"
import { AwardBadge } from "./award-badge"

export const WaitlistHero = () => {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center relative pt-20 pb-24 px-4 overflow-hidden bg-[#fafafa]">
      
      {/* ── Grid Background ── */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)',
          backgroundSize: '6rem 4rem',
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle 800px at 50% 50%, rgba(213,197,255,0.3), transparent)',
        }} />
      </div>

      {/* ── Orbs ── */}
      <div className="absolute top-[10%] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(244,197,168,0.4) 0%, rgba(200,184,224,0.3) 60%, transparent 80%)',
          filter: 'blur(80px)',
          animation: 'drift 20s ease-in-out infinite alternate',
        }} />
      <div className="absolute bottom-[10%] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(186,210,255,0.4) 0%, rgba(200,184,224,0.25) 60%, transparent 80%)',
          filter: 'blur(70px)',
          animation: 'drift2 16s ease-in-out infinite alternate',
        }} />

      {/* ── Content ── */}
      <div className="flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto z-20 relative">
        <AwardBadge />
        
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-0 mt-4">
          Para Profissionais de Eventos
        </p>
        
        <h1 
          style={{ fontFamily: 'var(--font-raleway), Georgia, serif', color: '#0a0a0a' }} 
          className="text-[2.5rem] md:text-[3.5rem] font-bold text-center tracking-[-0.02em] leading-tight max-w-3xl"
        >
          Indique o Memvor e ganhe por cada celebração
        </h1>

        <p className="text-[16px] text-[#676f7b] leading-relaxed max-w-lg text-center mb-4">
          Cerimonialistas, fotógrafos e assessores: ofereça uma experiência inovadora para seus clientes e receba <strong>25% de comissão</strong> por cada plano vendido através do seu link exclusivo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-4">
          <Link 
            href="/parceiros/cadastro"
            className="inline-block bg-[#0a0a0a] text-white text-sm font-bold px-10 py-4 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-xl text-center w-full sm:w-auto"
          >
            Quero ser parceiro
          </Link>
          <a 
            href="https://wa.me/5521978949944" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block border border-black/10 text-[#0a0a0a] text-sm font-bold px-10 py-4 rounded-full hover:bg-black/5 transition-all active:scale-95 text-center w-full sm:w-auto bg-white/40 backdrop-blur-md"
          >
            Falar com a equipe
          </a>
        </div>
      </div>
    </div>
  )
}
