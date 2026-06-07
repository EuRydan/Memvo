'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Novos estados para Perfis
  const [role, setRole] = useState<'host' | 'partner'>('host')
  const [companyName, setCompanyName] = useState('')
  const [cnpj, setCnpj] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sessionId = searchParams.get('session_id')
  const invite = searchParams.get('invite')
  const plan = searchParams.get('plan') || 'essential'
  const strength = getStrength(password)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setLoading(true)
    setError('')

    // 1. Create the user with specific metadata
    const metadata: any = { full_name: name, role }
    if (role === 'partner') {
      metadata.company_name = companyName
      metadata.cnpj = cnpj.replace(/\D/g, '')
    }

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

    if (authData.user && (sessionId || invite === 'memvor-vip-2026')) {
      // 2. Insert into user_plans (use 'classic' for invite registrations)
      const planToSave = invite === 'memvor-vip-2026' ? 'classic' : plan
      const paymentRef = invite === 'memvor-vip-2026' ? `invite-${authData.user.id}` : sessionId
      const { error: planError } = await supabase.from('user_plans').insert({
        user_id: authData.user.id,
        plan_id: planToSave,
        payment_id: paymentRef,
      })

      if (planError) {
        console.error('Failed to save plan:', planError)
      }
    }

    router.push('/dashboard')
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
      <div className="auth-card relative z-10 w-full max-w-[420px]">

        {/* Branding */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-stone uppercase mb-3">
            Junte-se a nós
          </p>
          <div className="flex justify-center mb-2">
            <Logo className="h-10 w-auto text-ink" />
          </div>
          <p className="text-sm text-slate mt-2">Crie sua conta para começar</p>
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
              Criar conta
            </h2>
            <p className="text-sm text-slate mt-1.5">Seu álbum de memórias começa aqui.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">

            {/* Role Toggle */}
            <div className="flex bg-stone-100 p-1 rounded-xl mb-2">
              <button 
                type="button" 
                onClick={() => setRole('host')} 
                className={`flex-1 text-[13px] font-semibold py-2.5 rounded-lg transition-all ${role === 'host' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#676f7b] hover:text-[#0a0a0a]'}`}
              >
                Sou Anfitrião
              </button>
              <button 
                type="button" 
                onClick={() => setRole('partner')} 
                className={`flex-1 text-[13px] font-semibold py-2.5 rounded-lg transition-all ${role === 'partner' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#676f7b] hover:text-[#0a0a0a]'}`}
              >
                Sou Parceiro
              </button>
            </div>

            {/* Full Name */}
            <div className="floating-group">
              <input
                id="name"
                type="text"
                placeholder=" "
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field w-full px-5 py-4 rounded-full text-sm text-ink"
                autoComplete="name"
                required
              />
              <label htmlFor="name">Nome completo</label>
            </div>

            {/* Email */}
            <div className="floating-group">
              <input
                id="email"
                type="email"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field w-full px-5 py-4 rounded-full text-sm text-ink"
                autoComplete="email"
                required
              />
              <label htmlFor="email">E-mail</label>
            </div>

            {/* Partner Specific Fields */}
            {role === 'partner' && (
              <>
                <div className="floating-group">
                  <input
                    id="company"
                    type="text"
                    placeholder=" "
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="input-field w-full px-5 py-4 rounded-full text-sm text-ink"
                    required
                  />
                  <label htmlFor="company">Nome da Empresa / Assessoria</label>
                </div>
                <div className="floating-group">
                  <input
                    id="cnpj"
                    type="text"
                    placeholder=" "
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="input-field w-full px-5 py-4 rounded-full text-sm text-ink"
                    required
                  />
                  <label htmlFor="cnpj">CNPJ / CPF</label>
                </div>
              </>
            )}

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="floating-group">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field w-full px-5 py-4 pr-12 rounded-full text-sm text-ink"
                    autoComplete="new-password"
                    required
                  />
                  <label
                    htmlFor="password"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1.25rem',
                      fontSize: '0.875rem',
                      color: '#939393',
                      fontWeight: 500,
                      pointerEvents: 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'transparent',
                    }}
                    className={`${password ? '!top-[-0.55rem] !left-[1.1rem] !text-[0.7rem] !tracking-[0.04em] !bg-white !px-[0.35rem] !text-ink !font-semibold' : ''}`}
                  >
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="px-1">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="flex-1 h-[3px] rounded-full transition-all duration-400"
                        style={{
                          backgroundColor: i <= strength.level ? strength.color : '#ebebeb',
                          transition: 'background-color 0.4s cubic-bezier(0.4,0,0.2,1)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                    <span className="text-stone font-normal ml-1">
                      {strength.level < 3 ? '— adicione maiúsculas e símbolos' : ''}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white py-4 rounded-full text-sm font-semibold tracking-wide hover:opacity-85 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-1 cursor-pointer"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Criando conta...
                </span>
              ) : 'Criar conta'}
            </button>

            {/* Terms */}
            <p className="text-center text-[11px] text-stone leading-relaxed px-2">
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className="text-ink font-semibold hover:underline">Termos</a>
              {' '}e{' '}
              <a href="#" className="text-ink font-semibold hover:underline">Política de Privacidade</a>.
            </p>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-slate mt-8">
          Já tem uma conta?{' '}
          <a href="/login" className="text-ink font-semibold hover:underline transition-colors">
            Entrar
          </a>
        </p>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
