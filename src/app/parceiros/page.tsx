import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { WordmarkFooter } from '@/components/WordmarkFooter'
import { ArcGalleryHero } from '@/components/ArcGalleryHero'
import { BenefitsSection } from '@/components/parceiros/BenefitsSection'
import { TargetAudience } from '@/components/parceiros/TargetAudience'
import { EarningsCalculator } from '@/components/parceiros/EarningsCalculator'
import { ParceirosFAQ } from '@/components/parceiros/ParceirosFAQ'

export default function ParceirosLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] overflow-clip relative">
      {/* Background orbs */}
      <div className="fixed top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(253,206,176,0.5) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'drift 20s ease-in-out infinite alternate',
        }} />
      <div className="fixed top-[-60px] right-[-100px] w-[380px] h-[380px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(235,220,255,0.5) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animationDelay: '-5s',
          animation: 'drift2 18s ease-in-out infinite alternate',
        }} />

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
          <Link href="/" className="flex items-center gap-2" aria-label="Memvor Home">
            <Logo className="h-6 w-auto text-black" theme="light" />
            <span className="sr-only">Memvor</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login"
              className="text-sm font-semibold text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors">
              Entrar
            </Link>
            <Link href="/parceiros/cadastro"
              className="bg-[#0a0a0a] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black/80 transition-all active:scale-95"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Quero ser parceiro
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <ArcGalleryHero 
        images={[
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=400'
        ]}
      />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative w-full py-20 bg-white z-10">
        <div className="text-center mb-16 px-6 max-w-lg mx-auto">
          <h2 style={{ fontFamily: 'var(--font-raleway), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">
            Como funciona em 3 passos
          </h2>
        </div>

        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Cadastre-se', desc: 'Preencha o formulário e crie seu perfil de profissional parceiro.' },
            { step: '02', title: 'Compartilhe seu link', desc: 'Receba seu link exclusivo e envie para os noivos ou debutantes.' },
            { step: '03', title: 'Receba sua comissão', desc: 'Acompanhe as vendas no seu painel e receba 25% diretamente no seu PIX.' }
          ].map((item, i) => (
            <div key={i} className="text-center p-8 rounded-3xl bg-[#fafafa] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold mx-auto mb-6">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-3">{item.title}</h3>
              <p className="text-sm text-[#676f7b]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <BenefitsSection />

      {/* ── TARGET AUDIENCE ── */}
      <TargetAudience />

      {/* ── EARNINGS CALCULATOR ── */}
      <EarningsCalculator />

      {/* ── FAQ ── */}
      <ParceirosFAQ />

      {/* ── FINAL CTA ── */}
      <section className="relative px-6 py-20 overflow-hidden mx-5 mb-10 rounded-[28px] mt-10"
        style={{
          background: 'linear-gradient(160deg, #f4c5a8 0%, #c8b8e0 55%, #b8d0f0 100%)',
        }}>
        <div className="relative text-center max-w-md mx-auto">
          <h2 style={{ fontFamily: 'var(--font-raleway), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-white leading-tight mb-4">
            Aumente sua renda indicando tecnologia de ponta
          </h2>
          <p className="text-sm text-white/90 mb-8 leading-relaxed">
            Programa em fase de lançamento — condições de fundador para os primeiros parceiros.
          </p>
          <Link href="/parceiros/cadastro"
            className="inline-block bg-white text-[#0a0a0a] text-sm font-bold px-8 py-4 rounded-full hover:bg-[#fafafa] transition-all active:scale-95 shadow-xl">
            Fazer cadastro agora
          </Link>
        </div>
      </section>

      <WordmarkFooter />
    </div>
  )
}
