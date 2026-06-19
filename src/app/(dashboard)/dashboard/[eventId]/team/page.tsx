'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCollaboratorLimit, isEventLocked, UserPlanRecord, hasEventAccess, resolveEventPlanId } from '@/lib/limits'
import { ButtonColorful } from '@/components/ui/button-colorful'
import { Trash2, Copy, Check, Users } from 'lucide-react'

export default function EventTeamPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [isOwner, setIsOwner] = useState(true)
  
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [limitInfo, setLimitInfo] = useState<{ max: number, accessLevel: 'full' | 'challenges_only' | null }>({ max: 0, accessLevel: null })
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: eventData } = await supabase.from('events').select('id, name, status, active').eq('id', eventId).single()
      if (!eventData) { router.push('/dashboard'); return }

      const access = await hasEventAccess(supabase, user.id, eventId)
      if (!access.accessLevel) {
        router.push('/dashboard')
        return
      }

      if (access.accessLevel === 'challenges_only') {
        router.push(`/dashboard/${eventId}/challenges`)
        return
      }

      setIsOwner(access.isOwner)

      const { data: plansData } = await supabase
        .from('user_plans')
        .select('event_id, plan_id')
        .eq('user_id', user.id)

      const userPlans: UserPlanRecord[] = (plansData || []) as UserPlanRecord[]
      
      const eventPlanId = resolveEventPlanId(userPlans, eventId)

      setLimitInfo(getCollaboratorLimit(eventPlanId))

      if (isEventLocked(eventId, userPlans, eventData || undefined)) {
        setIsLocked(true)
        setLoading(false)
        return
      }

      await loadCollaborators()
      setLoading(false)
    }
    load()
  }, [eventId])

  async function loadCollaborators() {
    const { data } = await supabase
      .from('event_collaborators')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (data) setCollaborators(data)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    setInviting(true)
    setInviteError('')
    setGeneratedLink('')

    try {
      const res = await fetch('/api/collaborators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, email: inviteEmail })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao convidar')

      setGeneratedLink(data.inviteLink)
      setInviteEmail('')
      await loadCollaborators()
    } catch (err: any) {
      setInviteError(err.message)
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remover este co-anfitrião? Ele perderá o acesso imediatamente.')) return
    try {
      const res = await fetch('/api/collaborators/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, collaboratorId: id })
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao remover')
        return
      }
      await loadCollaborators()
    } catch (e) {
      alert('Erro interno')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">Carregando...</div>
  if (isLocked) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">Evento aguardando ativação.</div>

  const isLimitReached = collaborators.length >= limitInfo.max

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col px-5 h-24 pt-4"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => router.push(`/dashboard/${eventId}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit text-sm font-medium mb-2 cursor-pointer"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Visão Geral
        </button>
      </header>

      <main className="relative z-10 pt-32 px-5 pb-36 max-w-lg mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-gray-400" size={24} /> Equipe
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Convide co-anfitriões para ajudarem a gerenciar seu evento.
          </p>
        </div>

        {limitInfo.max === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Recurso Premium/Clássico</h3>
            <p className="text-sm text-gray-500 mb-5">
              Faça upgrade do seu evento para convidar co-anfitriões e dividir a gestão das memórias.
            </p>
            <button
              onClick={() => router.push(`/dashboard/${eventId}/appearance`)} // Mock link to where plans are
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
            >
              Ver Planos
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Novo Convite</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {collaborators.length} de {limitInfo.max} usados
                </span>
              </div>
              
              {!isOwner ? (
                <p className="text-sm text-gray-500">Apenas o anfitrião principal pode convidar a equipe.</p>
              ) : isLimitReached ? (
                <p className="text-sm text-orange-600 font-medium">Você atingiu o limite de {limitInfo.max} co-anfitriões do seu plano.</p>
              ) : (
                <form onSubmit={handleInvite} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="E-mail do co-anfitrião"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                  />
                  <ButtonColorful label={inviting ? 'Gerando...' : 'Gerar Link de Convite'} onClick={() => {}} disabled={inviting} />
                  {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
                </form>
              )}

              {generatedLink && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">🔗 Link gerado com sucesso!</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                      title="Copiar Link"
                    >
                      {copiedLink ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Envie este link para o e-mail cadastrado.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Co-anfitriões</h3>
              {collaborators.length === 0 ? (
                <p className="text-sm text-gray-500">Ninguém convidado ainda.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {collaborators.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            c.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {c.status === 'accepted' ? 'Aceito' : 'Pendente'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {c.access_level === 'full' ? 'Acesso Total' : 'Só Desafios'}
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleRemove(c.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
