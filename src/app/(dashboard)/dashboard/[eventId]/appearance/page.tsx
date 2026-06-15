'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isEventLocked, UserPlanRecord, isAppearanceEnabled } from '@/lib/limits'
import { ButtonColorful } from '@/components/ui/button-colorful'

const THEME_COLORS = [
  { hex: '#4ac550', name: 'Verde Memvor (Padrão)' },
  { hex: '#f4c5a8', name: 'Pêssego Pastel' },
  { hex: '#d4bde8', name: 'Lavanda Suave' },
  { hex: '#b8d4f0', name: 'Azul Céu' },
  { hex: '#86efac', name: 'Verde Menta' },
  { hex: '#fda4af', name: 'Rosa Coral' }
]

export default function AppearancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [appearanceEnabled, setAppearanceEnabled] = useState(false)
  
  const [themeColor, setThemeColor] = useState('#4ac550')
  const [welcomeMessage, setWelcomeMessage] = useState('')

  useEffect(() => { loadEvent() }, [eventId])

  async function loadEvent() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: eventData } = await supabase
        .from('events')
        .select('status, active, theme_color, welcome_message')
        .eq('id', eventId)
        .single()

      if (eventData) {
        if (eventData.theme_color) setThemeColor(eventData.theme_color)
        if (eventData.welcome_message) setWelcomeMessage(eventData.welcome_message)
      }

      const { data: plansData } = await supabase
        .from('user_plans')
        .select('event_id, plan_id')
        .eq('user_id', user.id)

      const userPlans: UserPlanRecord[] = (plansData || []) as UserPlanRecord[]
      const eventPlanId = userPlans.find(p => p.event_id === eventId)?.plan_id
        || userPlans[userPlans.length - 1]?.plan_id
        || 'none'

      setAppearanceEnabled(isAppearanceEnabled(eventPlanId))

      if (isEventLocked(eventId, userPlans, eventData || undefined)) {
        setIsLocked(true)
        setLoading(false)
        return
      }
    }
    
    setLoading(false)
  }

  async function handleSave() {
    if (!appearanceEnabled) return
    setSaving(true)
    
    const { error } = await supabase
      .from('events')
      .update({
        theme_color: themeColor,
        welcome_message: welcomeMessage
      })
      .eq('id', eventId)

    setSaving(false)
    if (error) {
      alert('Erro ao salvar configurações.')
    } else {
      alert('Aparência salva com sucesso!')
    }
  }

  if (loading) return <div className="p-8 text-slate animate-pulse">Carregando...</div>
  
  if (isLocked) return (
    <div className="p-5 md:p-8">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-ink mb-2">Aparência Bloqueada</h2>
        <p className="text-sm text-slate mb-6">Você precisa ativar este evento efetuando o pagamento do plano para configurar o visual.</p>
      </div>
    </div>
  )

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-2xl">
        {/* Header Tabs */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone uppercase mb-2">Configuração</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs text-gray-900 font-medium border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
              🎨 Aparência
            </div>
            <button
              onClick={() => router.push(`/dashboard/${eventId}/challenges`)}
              className="text-xs text-gray-600 font-medium hover:text-gray-900 transition border border-gray-200 bg-white/50 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
            >
              Desafios
            </button>
          </div>
          <h1
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            className="text-[1.85rem] font-bold tracking-[-0.02em] text-ink leading-tight"
          >
            Personalize sua Página
          </h1>
          <p className="text-sm text-slate mt-2">
            Deixe o álbum digital com a cara da sua festa escolhendo a cor e a mensagem de boas-vindas.
          </p>
        </div>

        {!appearanceEnabled && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-orange-900 mb-1">Recurso Premium</h3>
            <p className="text-sm text-orange-800">
              A personalização visual exclusiva está disponível apenas nos planos <strong>Clássico</strong> e <strong>Premium</strong>. Faça upgrade para dar a sua cara à página!
            </p>
          </div>
        )}

        <div className={`space-y-8 ${!appearanceEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Accent Color Selector */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-ink mb-1">Cor de Destaque</h3>
            <p className="text-xs text-slate mb-5">
              Esta cor será usada nos botões, caixas de marcação e barras de progresso do seu evento.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {THEME_COLORS.map(color => (
                <button
                  key={color.hex}
                  onClick={() => setThemeColor(color.hex)}
                  className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                    themeColor === color.hex 
                      ? 'ring-4 ring-offset-2 ring-gray-900 scale-110' 
                      : 'hover:scale-105 border border-gray-200 shadow-sm'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-ink mb-1">Mensagem de Boas-vindas</h3>
            <p className="text-xs text-slate mb-4">
              Um pequeno texto que aparecerá abaixo do título na página principal do convidado.
            </p>
            
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Ex: Bem-vindos à nossa festa! Compartilhem seus melhores momentos conosco."
              className="w-full min-h-[100px] text-sm text-ink bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-gray-900/10 transition-shadow resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <ButtonColorful
              onClick={handleSave}
              disabled={saving}
              label={saving ? "Salvando..." : "Salvar Configurações"}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
