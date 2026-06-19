'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default function BrasilGameOnboarding() {
  const router = useRouter()
  const [name, setName] = useState('Jogo do Brasil X Haiti')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/brasil-game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/dashboard/${data.eventId}`)
      } else {
        setError(data.error || 'Erro ao criar álbum.')
      }
    } catch {
      setError('Erro ao criar álbum. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(250,250,250,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#939393] hover:text-[#0a0a0a] transition-colors text-sm font-medium"
        >
          ← Voltar
        </button>
        <Logo className="h-5 w-auto text-[#0a0a0a]" theme="light" />
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-20 pb-12">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🇧🇷</div>
            <h1 className="text-2xl font-bold text-[#0a0a0a] tracking-tight font-serif leading-tight">
              Álbum do Jogo
            </h1>
            <p className="text-sm text-[#676f7b] mt-2">
              Crie o álbum em segundos e compartilhe com a galera.
            </p>
          </div>

          {/* Date/time badge — read-only */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-white border border-[#e8e8e8] rounded-full px-4 py-2 text-xs font-semibold text-[#0a0a0a]">
              <span>📅</span> 19 de junho de 2026
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-[#e8e8e8] rounded-full px-4 py-2 text-xs font-semibold text-[#0a0a0a]">
              <span>🕘</span> 21h30
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#676f7b] mb-1.5 uppercase tracking-wide">
                Nome do álbum
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] bg-white text-[#0a0a0a] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#009C3B]/30 focus:border-[#009C3B] transition-all"
                placeholder="Ex: Jogo do Brasil X Haiti"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#676f7b] mb-1.5 uppercase tracking-wide">
                Local <span className="font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] bg-white text-[#0a0a0a] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#009C3B]/30 focus:border-[#009C3B] transition-all"
                placeholder="Ex: Casa do João, Bar da Copa..."
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="w-full py-4 rounded-xl text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{ background: loading ? '#555' : 'linear-gradient(90deg, #009C3B 0%, #007a2e 100%)' }}
            >
              {loading ? 'Criando álbum...' : '🇧🇷 Criar Álbum e Compartilhar'}
            </button>
          </div>

          {/* Features preview */}
          <div className="mt-8 bg-white border border-[#e8e8e8] rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-[#939393] uppercase tracking-widest mb-3">Incluído no seu álbum</p>
            <ul className="space-y-2">
              {[
                'Até 50 convidados via QR Code',
                '4 desafios fotográficos pré-definidos',
                '3 fotos por convidado em cada desafio',
                'Álbum em tempo real · 100% grátis',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-[#676f7b]">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#009C3B"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  )
}
