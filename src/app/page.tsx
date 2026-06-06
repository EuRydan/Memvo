import Link from 'next/link'
import { Logo } from '@/components/Logo'
import ClientFeedback from '@/components/client-feedback'
import { ArrowRight } from 'lucide-react'
import { PortfolioGallery } from '@/components/PortfolioGallery'
import { ZoomParallax } from '@/components/ZoomParallax'
import { IntroAnimation } from '@/components/IntroAnimation'
import { WordmarkFooter } from '@/components/WordmarkFooter'
import { FeaturesSection } from '@/components/FeaturesSection'
import { DemoSection } from '@/components/demo/DemoSection'
import { LoadingScreen } from '@/components/LoadingScreen'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] overflow-clip">
      <LoadingScreen />

      {/* ── Navbar ── */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between px-6 h-14 rounded-full w-full max-w-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <Link href="/" className="flex items-center gap-2" aria-label="Memvo Home">
            <Logo className="h-6 w-auto text-black" />
            <span className="sr-only">Memvo</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing"
              className="text-sm font-semibold text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors">
              Planos
            </Link>
            <Link href="/login"
              className="text-sm font-semibold text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors">
              Entrar
            </Link>
            <Link href="/register"
              className="bg-[#0a0a0a] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black/80 transition-all active:scale-95"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Começar
            </Link>
          </div>
        </nav>
      </div>

      {/* ── NEW HERO ── */}
      <IntroAnimation />

      {/* ── INTERACTIVE DEMO (HOW IT WORKS) ── */}
      <DemoSection />

      {/* ── TESTIMONIAL ── */}
      <ClientFeedback />

      {/* ── FEATURES GRID ── */}
      <FeaturesSection />

      {/* ── FINAL CTA ── */}
      <section className="relative px-6 py-20 overflow-hidden mx-5 mb-10 rounded-[28px]"
        style={{
          background: 'linear-gradient(160deg, #f4c5a8 0%, #c8b8e0 55%, #b8d0f0 100%)',
        }}>
        {/* Inner orb */}
        <div className="absolute top-[-40px] right-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />

        <div className="relative text-center max-w-xs mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase mb-4">Comece agora</p>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-white leading-tight mb-3">
            Preserve cada memória preciosa
          </h2>
          <p className="text-sm text-white/80 mb-8 leading-relaxed">
            Crie seu álbum em menos de 2 minutos. Pagamento único, sem assinatura.
          </p>
          <Link href="/pricing"
            className="inline-block bg-white text-[#0a0a0a] text-sm font-bold px-8 py-4 rounded-full hover:bg-[#fafafa] transition-all active:scale-95"
            style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}>
            Ver planos e preços
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <WordmarkFooter />

    </div>
  )
}
