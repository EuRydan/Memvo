'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 bg-canvas-warm">
      <div className="mx-auto bg-canvas p-8 border border-hairline w-full max-w-sm flex flex-col gap-6">
        <div>
          <span className="text-[11px] font-medium tracking-[0.2px] text-stone uppercase block mb-1">Acesso</span>
          <h1 className="text-3xl font-normal tracking-[-0.9px] text-ink">Entrar</h1>
          <p className="text-sm text-graphite mt-1">Acesse sua conta do Memvo</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink">E-mail</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink">Senha</label>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-on-primary rounded-full py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-xs text-graphite mt-2">
            Não tem conta?{' '}
            <a href="/register" className="text-ink font-semibold hover:underline">
              Criar conta
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
