'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sessionId = searchParams.get('session_id')
  const plan = searchParams.get('plan') || 'essential'

  useEffect(() => {
    async function verifyAndSavePlan() {
      if (!sessionId) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/dashboard/success?session_id=${sessionId}&plan=${plan}`)
        return
      }

      // Check if this payment_id already exists to prevent duplicates
      const { data: existingPlan } = await supabase
        .from('user_plans')
        .select('*')
        .eq('payment_id', sessionId)
        .maybeSingle()

      if (existingPlan) {
        // Already processed
        setLoading(false)
        return
      }

      // Insert new plan
      const { error: insertError } = await supabase.from('user_plans').insert({
        user_id: user.id,
        plan_id: plan,
        payment_id: sessionId,
      })

      if (insertError) {
        console.error('Error saving plan:', insertError)
        setError('Houve um problema ao processar sua assinatura. Por favor, contate o suporte.')
      }

      setLoading(false)
    }

    verifyAndSavePlan()
  }, [sessionId, plan, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-stone">Processando sua assinatura...</p>
        </div>
      </div>
    )
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

      <div className="auth-card relative z-10 w-full max-w-[420px] text-center">
        <div className="mb-8">
          <Logo className="h-10 w-auto text-ink mx-auto" />
        </div>

        <div
          className="rounded-[2rem] p-10 border border-white/60 bg-white/90 backdrop-blur-xl flex flex-col items-center"
          style={{
            boxShadow: '0 8px 40px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}
        >
          {error ? (
             <>
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                 <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </div>
               <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} className="text-2xl font-bold text-ink mb-3">
                 Algo deu errado
               </h2>
               <p className="text-sm text-slate mb-8 leading-relaxed">
                 {error}
               </p>
             </>
          ) : (
             <>
               <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                 <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} className="text-2xl font-bold text-ink mb-3">
                 Assinatura Confirmada!
               </h2>
               <p className="text-sm text-slate mb-8 leading-relaxed">
                 Sua compra foi processada com sucesso. Todos os recursos do Memvo foram desbloqueados.
               </p>
             </>
          )}

          <Link
            href="/dashboard"
            className="w-full bg-ink text-white font-semibold py-4 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200 cursor-pointer block"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <svg className="animate-spin text-stone" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
