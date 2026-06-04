'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/types'
import QRCodeGenerator from '@/components/QRCodeGenerator'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setEvents(data)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Seus Eventos</h1>
          <button
            onClick={() => router.push('/dashboard/new')}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Novo Evento
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {events.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-12">
            Nenhum evento ainda. Crie o primeiro!
          </p>
        )}

        {events.map(event => (
          <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-6">
            <div className="flex-1 flex flex-col gap-2">
              <h2 className="font-semibold text-gray-900">{event.name}</h2>
              <p className="text-sm text-gray-400">
                {new Date(event.date).toLocaleDateString('pt-BR')}
              </p>
              <div className="flex gap-3 mt-2">
                <a
                  href={`/e/${event.slug}`}
                  target="_blank"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Ver Álbum
                </a>
                <button
                  onClick={() => router.push(`/dashboard/${event.id}/challenges`)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Desafios
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <QRCodeGenerator slug={event.slug} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
