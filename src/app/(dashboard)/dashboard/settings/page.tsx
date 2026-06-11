'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isEventActive, countActiveEvents, PLAN_LIMITS, PlanTier } from '@/lib/limits'
import { Event } from '@/types'
import { CreditCard, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [planId, setPlanId] = useState<string>('none')
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      const { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (planData) {
        setPlanId(planData.plan_id || 'none')
      }

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (events) {
        setActiveCount(countActiveEvents(events))
      }
      
      setLoading(false)
    }
    
    load()
  }, [])

  const planNames: Record<string, string> = {
    freemium: 'Plano Grátis (Free)',
    essential: 'Essencial',
    classic: 'Clássico',
    premium: 'Premium',
    none: 'Nenhum Plano Ativo'
  }

  const displayPlanName = planNames[planId] || 'Nenhum'
  const maxEvents = planId !== 'none' && PLAN_LIMITS[planId as PlanTier] ? PLAN_LIMITS[planId as PlanTier] : (planId === 'freemium' ? 1 : 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Configurações e Assinatura
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seu plano e os limites da sua conta.</p>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 md:p-8">
        
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <CreditCard className="text-gray-400" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Seu Plano Atual</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Status</p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className={planId === 'none' ? 'text-red-500' : 'text-emerald-500'} />
                <span className="text-xl font-bold text-ink">{displayPlanName}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-ink text-white font-semibold py-2.5 px-5 rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap"
            >
              Gerenciar no Painel
            </button>
          </div>

          <div>
          </div>
        </div>

      </div>
    </div>
  )
}
