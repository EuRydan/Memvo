import Link from 'next/link'
import { PortfolioGallery } from '@/components/PortfolioGallery'
import { ZoomParallax } from '@/components/ZoomParallax'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] overflow-clip">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(250,250,250,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          className="text-xl font-bold tracking-[-0.02em] text-[#0a0a0a]">
          Memvo
        </span>
        <div className="flex items-center gap-3">
          <Link href="/pricing"
            className="text-sm font-medium text-[#676f7b] hover:text-[#0a0a0a] transition-colors">
            Planos
          </Link>
          <Link href="/login"
            className="text-sm font-medium text-[#676f7b] hover:text-[#0a0a0a] transition-colors">
            Entrar
          </Link>
          <Link href="/register"
            className="bg-[#0a0a0a] text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-85 transition-all active:scale-95"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
            Começar
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-start text-center px-6 pt-32 overflow-hidden">

        {/* Orb 1 — top right peach */}
        <div className="absolute top-[-80px] right-[-100px] w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,197,168,0.65) 0%, rgba(200,184,224,0.4) 60%, transparent 80%)',
            filter: 'blur(80px)',
            animation: 'drift 20s ease-in-out infinite alternate',
          }} />
        {/* Orb 2 — bottom left lavender */}
        <div className="absolute bottom-[-60px] left-[-80px] w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(186,210,255,0.5) 0%, rgba(200,184,224,0.35) 60%, transparent 80%)',
            filter: 'blur(70px)',
            animation: 'drift2 16s ease-in-out infinite alternate',
          }} />

        {/* Eyebrow */}
        <div className="relative flex items-center gap-2 mb-6">
          <div className="w-5 h-px bg-[#939393]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase">
            Álbuns de celebração
          </span>
          <div className="w-5 h-px bg-[#939393]" />
        </div>

        {/* Headline */}
        <h1 className="relative max-w-[340px] sm:max-w-xl"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          <span className="block text-[3rem] sm:text-[4rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#0a0a0a]">
            Cada momento,
          </span>
          <span className="block text-[3rem] sm:text-[4rem] font-bold leading-[1.05] tracking-[-0.03em]"
            style={{
              background: 'linear-gradient(135deg, #c8956a 0%, #9b7fc0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            compartilhado.
          </span>
        </h1>

        {/* Portfolio Gallery */}
        <div className="w-full mt-auto max-w-7xl mx-auto z-10">
          <PortfolioGallery 
            title="" 
            archiveButton={{ text: "Ver planos e preços", href: "/pricing" }}
            className="min-h-0 py-0"
            maxHeight={140}
          />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <div className="w-px h-10 bg-[#939393]" style={{ animation: 'fadeInUp 2s ease infinite' }} />
          <div className="w-1 h-1 rounded-full bg-[#939393]" />
        </div>
      </section>

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
            { src: "https://images.unsplash.com/photo-1516997184712-48419615a132?w=800&h=600&fit=crop&q=80" }
          ]} 
        />

        <div className="flex flex-col gap-4 mt-20 px-6 max-w-lg mx-auto">
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
            <div key={step}
              className="rounded-[20px] p-6 flex items-start gap-5"
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
                  <span className="text-[10px] font-mono font-semibold text-[#939393]">{step}</span>
                  <h3 className="text-[0.95rem] font-semibold text-[#0a0a0a]">{title}</h3>
                </div>
                <p className="text-sm text-[#676f7b] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="relative px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(160deg, rgba(244,197,168,0.2) 0%, rgba(200,184,224,0.2) 100%)',
          }} />
        <div className="relative max-w-sm mx-auto text-center">
          <div className="text-5xl mb-4 leading-none" style={{ fontFamily: 'Georgia, serif', color: '#c8956a' }}>"</div>
          <blockquote
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[1.35rem] font-semibold leading-snug tracking-[-0.01em] text-[#0a0a0a] mb-5">
            Foi incrível ver as fotos dos convidados aparecendo em tempo real durante o casamento.
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #f4c5a8, #c8b8e0)' }}>
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#0a0a0a]">Ana Paula</p>
              <p className="text-xs text-[#939393]">Casamento • Junho 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="px-6 py-16 max-w-lg mx-auto">
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Recursos</p>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[1.9rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">
            Tudo que você precisa
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '🔗', title: 'Link & QR Code', desc: 'Compartilhe por qualquer canal' },
            { emoji: '⚡', title: 'Tempo real', desc: 'Fotos aparecem instantaneamente' },
            { emoji: '🎯', title: 'Desafios', desc: 'Missões para engajar convidados' },
            { emoji: '📥', title: 'Download', desc: 'Baixe todas as fotos em HD' },
            { emoji: '🔒', title: 'Sem login', desc: 'Convidados enviam sem cadastro' },
            { emoji: '📱', title: 'Mobile first', desc: 'Funciona em qualquer celular' },
          ].map(({ emoji, title, desc }) => (
            <div key={title}
              className="rounded-[18px] p-5 flex flex-col gap-2"
              style={{
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}>
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-semibold text-[#0a0a0a] leading-snug">{title}</p>
              <p className="text-xs text-[#939393] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

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
      <footer className="py-10 px-6 text-center">
        <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          className="text-lg font-bold text-[#0a0a0a] mb-2">
          Memvo
        </p>
        <p className="text-xs text-[#939393]">
          © 2024 Memvo. Preservando suas histórias mais preciosas.
        </p>
      </footer>

    </div>
  )
}
