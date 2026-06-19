'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { ButtonColorful } from '@/components/ui/button-colorful'

export default function InvitePage({ params }: { params: Promise<{ invite_token: string }> }) {
  const { invite_token } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [invite, setInvite] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function load() {
      // 1. Fetch invite
      const { data: collabData, error: collabError } = await supabase
        .from('event_collaborators')
        .select('id, event_id, email, status, access_level')
        .eq('invite_token', invite_token)
        .single()

      if (collabError || !collabData) {
        setError('Convite inválido ou expirado.')
        setLoading(false)
        return
      }

      setInvite(collabData)

      // 2. Fetch event details
      const { data: eventData } = await supabase
        .from('events')
        .select('name, date, cover_url')
        .eq('id', collabData.event_id)
        .single()

      setEvent(eventData)

      // 3. Check auth
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      setLoading(false)
    }
    load()
  }, [invite_token, router, supabase])

  const handleAccept = async () => {
    if (!user) {
      // Not logged in -> Redirect to login with returnTo
      router.push(`/login?returnTo=/convite/${invite_token}`)
      return
    }

    if (user.email !== invite.email) {
      setError(`Este convite foi enviado para ${invite.email}. Você está logado como ${user.email}. Por favor, faça login com a conta correta.`)
      return
    }

    setAccepting(true)
    try {
      const { error } = await supabase
        .from('event_collaborators')
        .update({
          status: 'accepted',
          user_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invite.id)

      if (error) throw error

      // Redirect to dashboard
      router.push(`/dashboard/${invite.event_id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao aceitar convite')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <Logo />
        <p className="mt-8 text-gray-500 text-sm animate-pulse">Carregando convite...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-5">
        <Logo />
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium w-full"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    )
  }

  if (invite.status === 'accepted') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-5">
        <Logo />
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Convite já aceito!</h2>
          <p className="text-gray-600 text-sm mb-6">Você já faz parte da equipe deste evento.</p>
          <button
            onClick={() => router.push(`/dashboard/${invite.event_id}`)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium w-full"
          >
            Acessar Painel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-5">
      <Logo />
      
      <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4 tracking-wide uppercase">
            Convite de Equipe
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Você foi convidado!
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Ajude a organizar as memórias do evento:
          </p>
        </div>

        {event && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-center">
            <h2 className="font-bold text-gray-900 text-lg font-serif">{event.name}</h2>
            {event.date && <p className="text-xs text-gray-500 mt-1">{new Date(event.date).toLocaleDateString('pt-BR')}</p>}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              {invite.access_level === 'full' ? '🌟' : '📸'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Acesso: {invite.access_level === 'full' ? 'Total' : 'Apenas Desafios'}</p>
              <p className="text-xs">{invite.access_level === 'full' ? 'Controle total sobre o evento.' : 'Modere e organize fotos recebidas.'}</p>
            </div>
          </div>

          {!user && (
            <div className="text-center p-3">
              <p className="text-xs text-orange-600 font-medium">Você precisará fazer login ou criar uma conta para aceitar.</p>
            </div>
          )}
          
          <ButtonColorful 
            label={accepting ? 'Processando...' : (user ? 'Aceitar Convite' : 'Fazer Login e Aceitar')} 
            onClick={handleAccept} 
            disabled={accepting} 
          />
        </div>
      </div>
    </div>
  )
}
