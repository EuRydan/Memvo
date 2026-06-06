import Link from 'next/link'
import { Logo } from '@/components/Logo'
import ClientFeedback from '@/components/client-feedback'
import { ArrowRight } from 'lucide-react'
import { PortfolioGallery } from '@/components/PortfolioGallery'
import { ZoomParallax } from '@/components/ZoomParallax'
import { IntroAnimation } from '@/components/IntroAnimation'
import { WordmarkFooter } from '@/components/WordmarkFooter'
import { FeaturesSection } from '@/components/FeaturesSection'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
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

      {/* ── HOW IT WORKS ── */}
      <section className="relative w-full py-20">
        <div className="text-center mb-12 px-6 max-w-lg mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Como funciona</p>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[1.9rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">
            Simples para você,<br />mágico para seus convidados
          </h2>
        </div>

        <ZoomParallax 
          images={[
            { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&q=80" },
            { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80" },
            { src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80" },
            { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80" },
            { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop&q=80" },
            { src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80" },
            { src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&h=600&fit=crop&q=80" }
          ]} 
        />

        <div className="mt-20 px-6 max-w-3xl mx-auto">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {[
                {
                  step: '01',
                  icon: (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  ),
                  title: 'Crie e compartilhe via QR Code',
                  desc: 'Configure seu evento em segundos e compartilhe o QR Code. Sem cadastro para os convidados.',
                  gradient: 'linear-gradient(135deg, #f4c5a8 0%, #e8b898 100%)',
                },
                {
                  step: '02',
                  icon: (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  ),
                  title: 'Desafios fotográficos',
                  desc: 'Engaje seus convidados com missões criativas: primeira dança, brinde, selfie em grupo...',
                  gradient: 'linear-gradient(135deg, #c8b8e0 0%, #b8a8d0 100%)',
                },
                {
                  step: '03',
                  icon: (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                  ),
                  title: 'Álbum em tempo real',
                  desc: 'Todas as fotos aparecem instantaneamente no álbum. Acesse e baixe quando quiser.',
                  gradient: 'linear-gradient(135deg, #b8d4f0 0%, #a8c4e0 100%)',
                },
              ].map(({ step, icon, title, desc, gradient }) => (
                <CarouselItem key={step}>
                  <div className="rounded-[24px] p-8 md:p-10 flex items-start gap-6"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                    }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
                      style={{ background: gradient }}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-[#939393]">{step}</span>
                        <h3 className="text-base font-semibold text-[#0a0a0a]">{title}</h3>
                      </div>
                      <p className="text-[15px] text-[#676f7b] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-6">
              <CarouselPrevious className="static translate-y-0 translate-x-0 border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/5 text-[#0a0a0a]" />
              <CarouselNext className="static translate-y-0 translate-x-0 border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/5 text-[#0a0a0a]" />
            </div>
          </Carousel>
        </div>
      </section>

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
