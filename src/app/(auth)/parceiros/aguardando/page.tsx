import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function AguardandoAprovacao() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10 overflow-hidden bg-[#fafafa]">
      
      {/* Grid Background */}
      <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
              backgroundImage: 'linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)',
              backgroundSize: '6rem 4rem',
          }}
      >
          <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle 800px at 50% 50%, rgba(213,197,255,0.3), transparent)',
          }} />
      </div>

      <div className="auth-card relative z-10 w-full max-w-[420px] text-center">
        
        <div className="flex justify-center mb-6">
          <Logo className="h-10 w-auto text-ink" />
        </div>

        <div
          className="rounded-4xl p-10 border border-white/60 shadow-auth backdrop-blur-[20px]"
          style={{
            background: 'rgba(255,255,255,0.92)',
          }}
        >
          <div className="w-16 h-16 rounded-full bg-[#f4c5a8]/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2
            className="text-[1.7rem] font-bold tracking-[-0.02em] text-ink leading-tight mb-3 font-serif">
            Em análise
          </h2>
          
          <p className="text-sm text-slate leading-relaxed mb-8">
            Recebemos o seu cadastro com sucesso! Nossa equipe vai analisar o seu perfil e enviar um e-mail de confirmação em breve.
          </p>

          <Link href="/"
            className="inline-block w-full bg-stone-100 text-ink text-sm font-semibold px-6 py-4 rounded-full hover:bg-stone-200 transition-colors"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}
