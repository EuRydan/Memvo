'use client'

import Link from 'next/link'
import { useState } from 'react'

const PLANS = [
  {
    id: 'essential',
    name: 'Essencial',
    desc: 'Perfeito para pequenas reuniões',
    price: 'R$79',
    popular: false,
    features: [
      { text: 'Até 50 convidados', included: true },
      { text: 'Fotos ilimitadas', included: true },
      { text: 'Desafios fotográficos', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Download em ZIP', included: false },
      { text: 'Upload de vídeos', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'classic',
    name: 'Clássico',
    desc: 'Ideal para casamentos e festas',
    price: 'R$149',
    popular: true,
    features: [
      { text: 'Até 200 convidados', included: true },
      { text: 'Fotos ilimitadas', included: true },
      { text: 'Desafios fotográficos', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Download em ZIP', included: true },
      { text: 'Upload de vídeos (2 min)', included: true },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    desc: 'Para grandes celebrações',
    price: 'R$249',
    popular: false,
    features: [
      { text: 'Convidados ilimitados', included: true },
      { text: 'Fotos ilimitadas', included: true },
      { text: 'Desafios fotográficos', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Download em ZIP', included: true },
      { text: 'Upload de vídeos (10 min)', included: true },
      { text: 'Suporte prioritário', included: true },
    ],
  },
]

const FAQS = [
  {
    q: 'Os convidados precisam criar uma conta?',
    a: 'Não. Eles simplesmente escaneiam o QR Code e começam a compartilhar instantaneamente. Zero fricção.',
  },
  {
    q: 'Por quanto tempo o álbum fica disponível?',
    a: 'Para sempre, enquanto sua conta estiver ativa. Preservamos suas memórias como recordações digitais.',
  },
  {
    q: 'Posso fazer upgrade do meu plano?',
    a: 'Sim, a qualquer momento antes do evento. Você paga apenas a diferença entre os planos.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'É um pagamento único, sem assinatura recorrente. Você paga uma vez e usa para o seu evento.',
  },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">

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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
        <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors text-[#676f7b] hover:text-[#0a0a0a]">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          className="text-xl font-bold tracking-[-0.02em] text-[#0a0a0a]">
          Memvo
        </span>
        <Link href="/register"
          className="bg-[#0a0a0a] text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-85 transition-all"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
          Começar
        </Link>
      </header>

      <main className="relative z-10 pt-24 pb-20 px-5 max-w-lg mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Planos</p>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight mb-2">
            Escolha seu plano
          </h1>
          <p className="text-sm text-[#676f7b]">Pagamento único. Sem assinatura.</p>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="flex flex-col gap-4 mb-14">
          {PLANS.map(plan => (
            <div key={plan.id}
              className="rounded-[22px] overflow-hidden relative"
              style={{
                background: plan.popular ? '#0a0a0a' : 'rgba(255,255,255,0.95)',
                boxShadow: plan.popular
                  ? '0 12px 40px rgba(0,0,0,0.22)'
                  : '0 4px 24px rgba(0,0,0,0.06)',
                border: plan.popular ? 'none' : '1.5px solid rgba(0,0,0,0.06)',
              }}>

              {/* Gradient band — only on non-popular */}
              {!plan.popular && (
                <div className="h-[3.5px] w-full"
                  style={{ background: 'linear-gradient(90deg, #fdceb0 0%, #d0c0e8 100%)' }} />
              )}
              {/* Gradient band for popular */}
              {plan.popular && (
                <div className="h-[3.5px] w-full"
                  style={{ background: 'linear-gradient(90deg, #f4c5a8 0%, #c8b8e0 50%, #b8d4f0 100%)' }} />
              )}

              <div className="p-6">
                {/* Badge */}
                {plan.popular && (
                  <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f4c5a8]" />
                    <span className="text-[11px] font-semibold text-white/90 tracking-wide">Mais popular</span>
                  </div>
                )}

                {/* Name & price */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className={`text-xl font-bold tracking-[-0.01em] ${plan.popular ? 'text-white' : 'text-[#0a0a0a]'}`}
                      style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      {plan.name}
                    </h2>
                    <p className={`text-xs mt-0.5 ${plan.popular ? 'text-white/60' : 'text-[#939393]'}`}>
                      {plan.desc}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold tracking-[-0.02em] ${plan.popular ? 'text-white' : 'text-[#0a0a0a]'}`}>
                      {plan.price}
                    </p>
                    <p className={`text-[10px] ${plan.popular ? 'text-white/50' : 'text-[#939393]'}`}>
                      pagamento único
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f.text} className="flex items-center gap-3">
                      {f.included ? (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.popular ? 'rgba(255,255,255,0.2)' : 'rgba(74,197,80,0.12)' }}>
                          <svg width="9" height="9" fill="none" stroke={plan.popular ? 'white' : '#4ac550'} strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(0,0,0,0.05)' }}>
                          <svg width="8" height="8" fill="none" stroke="#c0c0c0" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </div>
                      )}
                      <span className={`text-sm ${f.included
                        ? plan.popular ? 'text-white/90' : 'text-[#0a0a0a]'
                        : plan.popular ? 'text-white/30' : 'text-[#c0c0c0]'}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/register"
                  className="block w-full text-center py-3.5 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
                  style={plan.popular
                    ? {
                        background: 'white',
                        color: '#0a0a0a',
                        boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
                      }
                    : {
                        background: 'transparent',
                        color: '#0a0a0a',
                        border: '2px solid rgba(0,0,0,0.12)',
                      }
                  }>
                  Escolher {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── Trust strip ── */}
        <div className="text-center mb-14">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mb-6">
            {['Pagamento único', 'Sem assinatura', 'Convidados nunca pagam'].map((t, i, arr) => (
              <span key={t} className="flex items-center gap-3">
                <span className="text-[11px] font-semibold tracking-widest text-[#939393] uppercase">{t}</span>
                {i < arr.length - 1 && <span className="text-[#e0e0e0]">•</span>}
              </span>
            ))}
          </div>
          <div className="flex justify-center items-center -space-x-3 mb-3">
            {['A', 'J', 'M', 'C'].map((letter, i) => (
              <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#fafafa]"
                style={{
                  background: [
                    'linear-gradient(135deg, #f4c5a8, #e0a888)',
                    'linear-gradient(135deg, #c8b8e0, #a898c8)',
                    'linear-gradient(135deg, #b8d4f0, #98b8d8)',
                    'linear-gradient(135deg, #f4c5a8, #c8b8e0)',
                  ][i],
                }}>
                {letter}
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-[#676f7b] italic">
            Confiado por +10.000 anfitriões em todo o mundo
          </p>
        </div>

        {/* ── Comparison table ── */}
        <section className="mb-14">
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[1.3rem] font-bold text-[#0a0a0a] text-center mb-5">
            Comparação de planos
          </h2>
          <div className="rounded-[18px] overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            {/* Header */}
            <div className="grid grid-cols-4 px-4 py-3"
              style={{ borderBottom: '1px solid #f0f0f0', background: '#f8f8f8' }}>
              <p className="text-[11px] font-semibold text-[#939393] uppercase tracking-wide">Recurso</p>
              {['Ess.', 'Clá.', 'Pre.'].map(h => (
                <p key={h} className="text-[11px] font-semibold text-[#939393] uppercase tracking-wide text-center">{h}</p>
              ))}
            </div>
            {[
              { feature: 'Convidados máx.', values: ['50', '200', '∞'] },
              { feature: 'Fotos', values: ['∞', '∞', '∞'] },
              { feature: 'Desafios', values: [true, true, true] },
              { feature: 'Download ZIP', values: [false, true, true] },
              { feature: 'Vídeos', values: ['—', '2 min', '10 min'] },
              { feature: 'Suporte prio.', values: [false, false, true] },
            ].map(({ feature, values }, ri) => (
              <div key={feature} className="grid grid-cols-4 px-4 py-3.5"
                style={{ borderBottom: ri < 5 ? '1px solid #f5f5f5' : 'none' }}>
                <p className="text-xs text-[#676f7b]">{feature}</p>
                {values.map((v, i) => (
                  <div key={i} className="flex justify-center items-center">
                    {typeof v === 'boolean' ? (
                      v ? (
                        <svg width="14" height="14" fill="none" stroke="#4ac550" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" fill="none" stroke="#d0d0d0" strokeWidth="2.5" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )
                    ) : (
                      <span className={`text-xs font-semibold ${i === 1 ? 'text-[#0a0a0a]' : 'text-[#676f7b]'}`}>{v}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-14">
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[1.3rem] font-bold text-[#0a0a0a] text-center mb-5">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div key={i}
                className="rounded-[16px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-[#0a0a0a] pr-4 leading-snug">{faq.q}</span>
                  <div
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      background: openFaq === i ? '#0a0a0a' : '#f0f0f0',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>
                    <svg width="12" height="12" fill="none"
                      stroke={openFaq === i ? 'white' : '#676f7b'}
                      strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-[#676f7b] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <div className="rounded-[24px] overflow-hidden relative"
          style={{ background: 'linear-gradient(160deg, #f4c5a8 0%, #c8b8e0 55%, #b8d0f0 100%)' }}>
          <div className="absolute top-[-30px] right-[-30px] w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />
          <div className="relative p-8 text-center">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase mb-3">Começar agora</p>
            <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              className="text-[1.7rem] font-bold text-white leading-tight mb-3 tracking-[-0.02em]">
              Pronto para criar sua celebração?
            </h2>
            <p className="text-sm text-white/80 mb-7 leading-relaxed">
              Pagamento único. Álbum para sempre. Sem surpresas.
            </p>
            <Link href="/register"
              className="inline-block bg-white text-[#0a0a0a] text-sm font-bold px-8 py-4 rounded-full hover:bg-[#fafafa] transition-all active:scale-95"
              style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}>
              Criar minha conta
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          className="text-base font-bold text-[#0a0a0a] mb-1">Memvo</p>
        <p className="text-xs text-[#939393]">© 2024 Memvo. Preservando suas histórias mais preciosas.</p>
      </footer>

    </div>
  )
}
