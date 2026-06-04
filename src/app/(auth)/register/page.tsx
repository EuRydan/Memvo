'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 bg-canvas-warm">
      <div className="mx-auto bg-canvas p-8 border border-hairline w-full max-w-sm flex flex-col gap-6">
        <div>
          <span className="text-[11px] font-medium tracking-[0.2px] text-stone uppercase block mb-1">Registro</span>
          <h1 className="text-3xl font-normal tracking-[-0.9px] text-ink">Criar conta</h1>
          <p className="text-sm text-graphite mt-1">Comece a criar seu álbum de memórias</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink">Seu nome</label>
              <input
                type="text"
                placeholder="Como quer ser chamado"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary rounded-full py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <p className="text-center text-xs text-graphite mt-2">
            Já tem conta?{' '}
            <a href="/login" className="text-ink font-semibold hover:underline">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
