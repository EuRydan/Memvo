'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

export function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const role = user.user_metadata?.role
        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
          router.push(redirectTo)
        } else if (role === 'affiliate') {
          router.push('/parceiros/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    })
  }, [router, searchParams, supabase.auth])

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role

    const redirectTo = searchParams.get('redirect')
    if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      router.push(redirectTo)
    } else if (role === 'affiliate') {
      router.push('/parceiros/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden bg-[#fafafa]">

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
            Bem-vindo de volta
          </p>
          <div className="flex justify-center mb-2">
            <Logo className="h-10 w-auto text-ink" />
          </div>
          <p className="text-sm text-slate mt-2">Acesse seu cofre de memórias digitais</p>
        </div>

        {/* Glass Card */}
        <div
          className="rounded-4xl p-8 border border-white/60 shadow-auth backdrop-blur-[20px]"
          style={{
            background: 'rgba(255,255,255,0.92)',
          }}
        >
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

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
              />
              <label htmlFor="email">E-mail</label>
            </div>

            {/* Password */}
            <div className="floating-group">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field w-full px-5 py-4 pr-12 rounded-full text-sm text-ink"
                  autoComplete="current-password"
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
                  className={`${password || showPassword ? '!top-[-0.55rem] !left-[1.1rem] !text-[0.7rem] !tracking-[0.04em] !bg-white !px-[0.35rem] !text-ink !font-semibold' : ''}`}
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

            {/* Forgot password */}
            <div className="text-right -mt-2">
              <a href="#" className="text-xs text-slate hover:text-ink transition-colors font-medium">
                Esqueceu a senha?
              </a>
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white py-4 rounded-full text-sm font-semibold tracking-wide hover:opacity-85 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-1 cursor-pointer shadow-strong"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-grow h-px bg-hairline" />
              <span className="text-xs text-stone font-medium">ou</span>
              <div className="flex-grow h-px bg-hairline" />
            </div>

            {/* Create Account */}
            <a
              href={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
              className="block w-full text-center border-2 border-hairline text-ink py-4 rounded-full text-sm font-semibold hover:bg-[#f5f5f5] hover:border-hairline-soft active:scale-[0.98] transition-all duration-200"
            >
              Criar conta
            </a>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-stone mt-8">
          © 2024 Memvor. Preservando suas histórias mais preciosas.
        </p>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
