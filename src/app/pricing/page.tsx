'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import CheckoutForm from './CheckoutForm'
import { WordmarkFooter } from '@/components/WordmarkFooter'
import { Logo } from '@/components/Logo'

const PLANS = [
  {
    id: 'freemium',
    name: 'Teste Grátis',
    desc: 'Para testar o funcionamento',
    price: 'R$0',
    popular: false,
    features: [
      { text: 'Até 10 convidados', included: true },
      { text: '1 foto por convidado no desafio', included: true },
      { text: 'Até 1 desafio fotográfico', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Álbum Livre (Sem desafios)', included: false },
      { text: 'Download em ZIP', included: false },
      { text: 'Upload de vídeos', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'essential',
    name: 'Essencial',
    desc: 'Perfeito para pequenas reuniões',
    price: 'R$79',
    popular: false,
    features: [
      { text: 'Até 50 convidados', included: true },
      { text: '3 fotos por convidado no desafio', included: true },
      { text: 'Até 5 desafios fotográficos', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Álbum Livre (Sem desafios)', included: false },
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
      { text: 'Desafios ilimitados', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Álbum Livre (Sem desafios)', included: false },
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
      { text: 'Desafios ilimitados', included: true },
      { text: 'Álbum em tempo real', included: true },
      { text: 'Download do QR Code', included: true },
      { text: 'Álbum Livre (Sem desafios)', included: true },
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
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)

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
        <Logo className="h-6 w-auto text-[#0a0a0a]" />
        <Link href="/register"
          className="bg-[#0a0a0a] text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-85 transition-all"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
          Começar
        </Link>
      </header>

      <main className={`relative z-10 pt-24 pb-20 px-5 mx-auto transition-all duration-500 ${selectedPlan ? 'max-w-5xl' : 'max-w-[1400px]'}`}>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Planos</p>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight mb-2">
            Escolha seu plano
          </h1>
          <p className="text-sm text-[#676f7b]">Pagamento único. Sem assinatura.</p>
        </div>

        {/* ── Pricing Cards / Gateway ── */}
        {!selectedPlan ? (
          <div className="flex flex-nowrap overflow-x-auto items-stretch justify-start xl:justify-center gap-6 lg:gap-8 mb-14 pt-12 pb-12 snap-x snap-mandatory px-4 sm:px-0" style={{ scrollbarWidth: 'none' }}>
            {PLANS.map(plan => (
              <div key={plan.id}
                className={`shrink-0 snap-center w-full max-w-[320px] md:w-80 relative text-center border p-8 pb-14 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                  plan.popular 
                    ? 'bg-[#0a0a0a] text-white border-white/10 shadow-2xl md:scale-105 z-10' 
                    : 'bg-white text-gray-800/80 border-gray-200 shadow-sm'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div 
                    className="absolute px-3 text-xs font-semibold tracking-wide -top-3.5 left-1/2 -translate-x-1/2 py-1 rounded-full text-[#0a0a0a]"
                    style={{ background: 'linear-gradient(90deg, #f4c5a8 0%, #c8b8e0 50%, #b8d4f0 100%)' }}
                  >
                    Mais popular
                  </div>
                )}

                <p className={`font-semibold ${plan.popular ? 'pt-2' : ''}`}>{plan.name}</p>
                <h1 className={`text-4xl font-bold mt-2 ${plan.popular ? 'text-white' : plan.price === 'R$0' ? 'text-gray-400' : 'text-[#0a0a0a]'}`}>
                  {plan.price}
                  <span className={`text-sm font-normal block mt-1 ${plan.popular ? 'text-white/60' : 'text-gray-500'}`}>
                    pagamento único
                  </span>
                </h1>

                <ul className={`list-none text-sm mt-8 space-y-3 text-left ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}>
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {f.included ? (
                        <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill={plan.popular ? '#fff' : '#0a0a0a'}/>
                        </svg>
                      ) : (
                        <svg className="flex-shrink-0 mt-0.5 opacity-30" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 5.56l-1.06-1.06-3.44 3.44-3.44-3.44-1.06 1.06 3.44 3.44-3.44 3.44 1.06 1.06 3.44-3.44 3.44 3.44 1.06-1.06-3.44-3.44 3.44-3.44z" fill={plan.popular ? '#fff' : '#0a0a0a'}/>
                        </svg>
                      )}
                      <p className={f.included ? '' : 'opacity-40 line-through'}>{f.text}</p>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setSelectedPlan(plan)}
                  type="button" 
                  className={`text-sm w-full py-3.5 rounded-xl font-semibold mt-auto transition-all active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-white text-[#0a0a0a] hover:bg-gray-100'
                      : 'bg-[#0a0a0a] text-white hover:bg-gray-900'
                  }`}
                >
                  Começar agora
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 items-start animate-fade-in">
            {/* Left: Selected Plan */}
            <div className={`w-full max-w-[320px] mx-auto md:max-w-sm relative text-center border p-8 pb-14 rounded-2xl ${
                selectedPlan.popular 
                  ? 'bg-[#0a0a0a] text-white border-white/10 shadow-2xl' 
                  : 'bg-white text-gray-800/80 border-gray-200 shadow-sm'
              }`}
            >
              {/* Popular Badge */}
              {selectedPlan.popular && (
                <div 
                  className="absolute px-3 text-xs font-semibold tracking-wide -top-3.5 left-1/2 -translate-x-1/2 py-1 rounded-full text-[#0a0a0a]"
                  style={{ background: 'linear-gradient(90deg, #f4c5a8 0%, #c8b8e0 50%, #b8d4f0 100%)' }}
                >
                  Mais popular
                </div>
              )}

              <p className={`font-semibold ${selectedPlan.popular ? 'pt-2' : ''}`}>{selectedPlan.name}</p>
              <h1 className={`text-4xl font-bold mt-2 ${selectedPlan.popular ? 'text-white' : selectedPlan.price === 'R$0' ? 'text-gray-400' : 'text-[#0a0a0a]'}`}>
                {selectedPlan.price}
                <span className={`text-sm font-normal block mt-1 ${selectedPlan.popular ? 'text-white/60' : 'text-gray-500'}`}>
                  pagamento único
                </span>
              </h1>

              <ul className={`list-none text-sm mt-8 space-y-3 text-left ${selectedPlan.popular ? 'text-white/90' : 'text-gray-600'}`}>
                {selectedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {f.included ? (
                      <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill={selectedPlan.popular ? '#fff' : '#0a0a0a'}/>
                      </svg>
                    ) : (
                      <svg className="flex-shrink-0 mt-0.5 opacity-30" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.5 5.56l-1.06-1.06-3.44 3.44-3.44-3.44-1.06 1.06 3.44 3.44-3.44 3.44 1.06 1.06 3.44-3.44 3.44 3.44 1.06-1.06-3.44-3.44 3.44-3.44z" fill={selectedPlan.popular ? '#fff' : '#0a0a0a'}/>
                      </svg>
                    )}
                    <p className={f.included ? '' : 'opacity-40 line-through'}>{f.text}</p>
                  </li>
                ))}
              </ul>

              <button onClick={() => setSelectedPlan(null)}
                className={`mt-8 text-xs font-semibold hover:underline ${selectedPlan.popular ? 'text-white/60' : 'text-[#676f7b]'}`}>
                ← Escolher outro plano
              </button>
            </div>

            {/* Right: Payment Gateway via Stripe Elements */}
            <div className="rounded-[22px] overflow-hidden bg-white p-7 md:p-8 flex flex-col"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', minHeight: '400px' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[1.3rem] font-bold text-[#0a0a0a]" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  Pagamento Seguro
                </h3>
              </div>
              <div className="flex justify-between items-center mb-6 pt-6 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Total a pagar</span>
                <span className={`text-xl font-bold tracking-tight ${selectedPlan.price === 'R$0' ? 'text-gray-400' : 'text-[#0a0a0a]'}`}>{selectedPlan.price}</span>
              </div>
              <p className="text-[11px] font-semibold text-[#939393] uppercase tracking-widest mb-6">Ambiente protegido</p>

              <CheckoutForm 
                planId={selectedPlan.id} 
                planPrice={selectedPlan.price} 
                returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/success?plan=${selectedPlan.id}`} 
              />
            </div>
          </div>
        )}

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
      <WordmarkFooter />

    </div>
  )
}
