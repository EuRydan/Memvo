'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

// Password strength logic
function getStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++

  if (score === 1) return { level: 1, label: 'Fraca', color: '#ef4444' }
  if (score === 2) return { level: 2, label: 'Razoável', color: '#f97316' }
  if (score === 3) return { level: 3, label: 'Boa', color: '#84cc16' }
  return { level: 4, label: 'Forte', color: '#22c55e' }
}

function AffiliateRegisterContent() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [profession, setProfession] = useState('Cerimonialista')
  const [pixKey, setPixKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(password)

  // Generate a simple affiliate code based on first name and random numbers
  const generateAffiliateCode = (fullName: string) => {
    const firstName = fullName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `${firstName}${randomNum}`
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (!pixKey) {
      setError('A chave PIX é obrigatória para o repasse das comissões.')
      return
    }
    setLoading(true)
    setError('')

    // 1. Create the user with metadata
    const metadata: any = { full_name: name, role: 'affiliate' }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // 2. Insert into affiliates table
      const code = generateAffiliateCode(name)
      const { error: affiliateError } = await supabase.from('affiliates').insert({
        user_id: authData.user.id,
        name: name,
        profession: profession,
        pix_key: pixKey,
        affiliate_code: code,
        status: 'pending'
      })

      if (affiliateError) {
        console.error('Failed to create affiliate record:', affiliateError)
        setError('Sua conta foi criada, mas houve um erro ao registrar como afiliado. Entre em contato com o suporte.')
        setLoading(false)
        return
      }
    }

    router.push('/afiliados/aguardando')
  }

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

      {/* Orbs */}
      <div className="absolute top-[10%] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
              background: 'radial-gradient(circle, rgba(244,197,168,0.4) 0%, rgba(200,184,224,0.3) 60%, transparent 80%)',
              filter: 'blur(80px)',
              animation: 'drift 20s ease-in-out infinite alternate',
          }} />
      <div className="absolute bottom-[10%] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
              background: 'radial-gradient(circle, rgba(186,210,255,0.4) 0%, rgba(200,184,224,0.25) 60%, transparent 80%)',
              filter: 'blur(70px)',
              animation: 'drift2 16s ease-in-out infinite alternate',
          }} />

      {/* Card */}
      <div className="auth-card relative z-10 w-full max-w-[500px] my-10">

        {/* Branding */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-stone uppercase mb-3">
            Programa de Parceiros
          </p>
          <div className="flex justify-center mb-2">
            <Logo className="h-10 w-auto text-ink" />
          </div>
          <p className="text-sm text-slate mt-2">Torne-se um afiliado e aumente sua renda.</p>
        </div>

        {/* Glass Card */}
        <div
          className="rounded-[2rem] p-8 border border-white/60"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}
        >
          <div className="text-center mb-7">
            <h2
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              className="text-[1.7rem] font-bold tracking-[-0.02em] text-ink leading-tight"
            >
              Cadastro de Afiliado
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 ml-1">NOME COMPLETO</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 text-ink text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#d5c5ff] focus:border-transparent transition-all"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 ml-1">E-MAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 text-ink text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#d5c5ff] focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 ml-1">WHATSAPP</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-ink text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#d5c5ff] focus:border-transparent transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 ml-1">PROFISSÃO</label>
                <select
                  required
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-ink text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#d5c5ff] focus:border-transparent transition-all appearance-none"
                >
                  <option value="Cerimonialista">Cerimonialista</option>
                  <option value="Fotógrafo(a)">Fotógrafo(a)</option>
                  <option value="Assessor(a)">Assessor(a)</option>
                  <option value="Influenciador(a)">Influenciador(a)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 ml-1">CHAVE PIX (PARA RECEBER COMISSÃO)</label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-white border border-gray-200 text-ink text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#d5c5ff] focus:border-transparent transition-all"
                placeholder="E-mail, CPF, Telefone ou Chave Aleatória"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 ml-1">SENHA</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-ink text-sm rounded-2xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#d5c5ff] focus:border-transparent transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 flex items-center justify-between px-1">
                  <div className="flex gap-1.5 flex-1 max-w-[150px]">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className="h-1.5 rounded-full flex-1 transition-all duration-300"
                        style={{
                          backgroundColor: strength.level >= num ? strength.color : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white text-sm font-bold py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Criar conta de afiliado'
              )}
            </button>

            <p className="text-center text-xs text-slate mt-5 px-4 leading-relaxed">
              Ao se cadastrar, você concorda com nossos <Link href="/terms" className="text-ink underline underline-offset-2 font-medium">Termos de Uso</Link> e passará por uma rápida análise de perfil.
            </p>
          </form>

        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-stone mt-8">
          Já tem conta?{' '}
          <Link href="/login" className="text-ink font-semibold hover:underline underline-offset-4">
            Faça login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default function AffiliateRegister() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <AffiliateRegisterContent />
    </Suspense>
  )
}
