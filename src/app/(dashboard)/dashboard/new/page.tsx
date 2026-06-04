'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  // Função para criar o slug (ex: "Casamento Ana e Pedro" -> "casamento-ana-e-pedro")
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-') // substitui espaços/especiais por hífen
      .replace(/(^-|-$)+/g, '') // remove hífens extras nas pontas
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = generateSlug(name)

    const { error } = await supabase.from('events').insert([
      { 
        name, 
        date, 
        slug, 
        owner_id: user.id,
        active: true 
      }
    ])

    if (error) {
      alert('Erro ao criar evento: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 bg-canvas-warm">
      <div className="mx-auto bg-canvas p-8 border border-hairline w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-slate hover:text-ink transition text-lg leading-none cursor-pointer"
          >
            ←
          </button>
          <div>
            <span className="text-[11px] font-medium tracking-[0.2px] text-stone uppercase block mb-1">Criação</span>
            <h1 className="text-3xl font-normal tracking-[-0.9px] text-ink">Novo Evento</h1>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink">Nome do evento</label>
              <input
                required
                placeholder="Ex: Casamento Ana e Pedro"
                className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition placeholder:text-stone bg-transparent"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink">Data do evento</label>
              <input
                required
                type="date"
                className="w-full border-b border-hairline py-2 text-sm outline-none focus:border-ink transition text-ink bg-transparent"
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary text-on-primary rounded-full py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Criando...' : 'Criar Evento'}
          </button>
        </form>
      </div>
    </div>
  )
}
