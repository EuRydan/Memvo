'use client'

import Link from 'next/link'
import { useState } from 'react'
import { WordmarkFooter } from '@/components/WordmarkFooter'
import { Logo } from '@/components/Logo'

const PACKAGES = [
  {
    id: 'pack_5',
    name: 'Pacote Starter',
    events: 5,
    price: 'R$ 590', // 118 per event (vs 149 default classic)
    savings: 'Economize R$ 155',
    popular: false,
  },
  {
    id: 'pack_10',
    name: 'Pacote Pro',
    events: 10,
    price: 'R$ 990', // 99 per event
    savings: 'Economize R$ 500',
    popular: true,
  },
  {
    id: 'pack_20',
    name: 'Pacote Elite',
    events: 20,
    price: 'R$ 1.580', // 79 per event
    savings: 'Economize R$ 1.400',
    popular: false,
  }
]

export default function PartnersPage() {
  const [selectedPack, setSelectedPack] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(186,210,255,0.4) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'drift 20s ease-in-out infinite alternate',
        }} />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(200,184,224,0.35) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animationDelay: '-5s',
          animation: 'drift2 18s ease-in-out infinite alternate',
        }} />

      {/* Navbar */}
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
        <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto text-[#0a0a0a]" />
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#0a0a0a] text-white px-2 py-0.5 rounded-sm">Partners</span>
        </div>
        <Link href="/login" className="text-sm font-semibold text-[#676f7b] hover:text-[#0a0a0a] transition-colors">
          Entrar
        </Link>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight mb-4">
            Escale sua Assessoria com o Memvo
          </h1>
          <p className="text-lg text-[#676f7b] max-w-2xl mx-auto">
            Ofereça uma experiência premium e inovadora de compartilhamento de fotos para seus noivos. Compre em atacado, gere vouchers e aumente sua margem de lucro.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PACKAGES.map(pack => (
            <div key={pack.id}
              className="rounded-[24px] overflow-hidden relative flex flex-col"
              style={{
                background: pack.popular ? '#0a0a0a' : 'rgba(255,255,255,0.95)',
                boxShadow: pack.popular ? '0 12px 40px rgba(0,0,0,0.22)' : '0 4px 24px rgba(0,0,0,0.06)',
                border: pack.popular ? 'none' : '1px solid rgba(0,0,0,0.08)',
                transform: pack.popular ? 'scale(1.02)' : 'scale(1)',
                zIndex: pack.popular ? 10 : 1,
              }}>
              
              {pack.popular && (
                <div className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, #f4c5a8 0%, #b8d4f0 100%)' }} />
              )}

              <div className="p-8 flex flex-col flex-1">
                {pack.popular && (
                  <div className="inline-block text-[10px] font-bold tracking-widest text-white/90 uppercase mb-4 px-3 py-1 rounded-full border border-white/20 bg-white/10 self-start">
                    Mais Escolhido
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-1 ${pack.popular ? 'text-white' : 'text-[#0a0a0a]'}`}>
                  {pack.name}
                </h3>
                <p className={`text-sm mb-6 ${pack.popular ? 'text-white/60' : 'text-[#676f7b]'}`}>
                  {pack.events} Eventos Clássicos
                </p>

                <div className="mb-2">
                  <span className={`text-4xl font-bold tracking-tight ${pack.popular ? 'text-white' : 'text-[#0a0a0a]'}`}>
                    {pack.price}
                  </span>
                </div>
                <p className={`text-xs font-semibold mb-8 px-2 py-1 inline-block rounded-md self-start ${pack.popular ? 'bg-[#4ac550]/20 text-[#4ac550]' : 'bg-emerald-50 text-emerald-600'}`}>
                  {pack.savings}
                </p>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  <li className="flex items-center gap-3">
                    <svg width="16" height="16" fill="none" stroke={pack.popular ? '#4ac550' : '#0a0a0a'} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className={`text-sm font-medium ${pack.popular ? 'text-white/80' : 'text-[#676f7b]'}`}>{pack.events} Vouchers Exclusivos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="16" height="16" fill="none" stroke={pack.popular ? '#4ac550' : '#0a0a0a'} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className={`text-sm font-medium ${pack.popular ? 'text-white/80' : 'text-[#676f7b]'}`}>Painel de Gerenciamento</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="16" height="16" fill="none" stroke={pack.popular ? '#4ac550' : '#0a0a0a'} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className={`text-sm font-medium ${pack.popular ? 'text-white/80' : 'text-[#676f7b]'}`}>Validade de 12 meses</span>
                  </li>
                </ul>

                <Link 
                  href={`/cerimonialistas/checkout?pack=${pack.id}`}
                  className={`w-full py-4 rounded-full text-sm font-bold transition-all active:scale-95 text-center inline-block ${pack.popular ? 'bg-white text-[#0a0a0a] hover:bg-stone-100' : 'bg-[#0a0a0a] text-white hover:opacity-90'}`}
                >
                  Comprar Pacote
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section className="bg-white rounded-[32px] p-10 md:p-16 text-center" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }} className="text-3xl font-bold text-[#0a0a0a] mb-12">
            Como funciona o fluxo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm border border-stone-100">🛒</div>
              <h4 className="font-bold text-[#0a0a0a] mb-2">1. Você Compra</h4>
              <p className="text-sm text-[#676f7b]">Adquire um pacote em lote com desconto exclusivo para parceiros.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm border border-stone-100">🎟️</div>
              <h4 className="font-bold text-[#0a0a0a] mb-2">2. Gera Vouchers</h4>
              <p className="text-sm text-[#676f7b]">Seu painel libera códigos únicos (ex: MEMVO-PRO-123) para você repassar aos clientes.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm border border-stone-100">✨</div>
              <h4 className="font-bold text-[#0a0a0a] mb-2">3. Cliente Ativa</h4>
              <p className="text-sm text-[#676f7b]">Os noivos criam a conta e ativam o evento usando o seu código sem pagar nada a mais.</p>
            </div>
          </div>
        </section>
      </main>

      <WordmarkFooter />
    </div>
  )
}
