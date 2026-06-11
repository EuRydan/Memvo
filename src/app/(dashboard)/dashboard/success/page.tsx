'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success'>('loading')

  useEffect(() => {
    if (!sessionId) return

    const supabase = createClient()

    // 1. Check if it's already approved
    const checkStatus = async () => {
      const { data } = await supabase
        .from('payment_intents')
        .select('status')
        .eq('id', sessionId)
        .maybeSingle()
        
      if (data?.status === 'approved') {
        setStatus('success')
      }
    }
    
    checkStatus()

    // 2. Poll the verify endpoint every 3 seconds as a robust fallback to webhooks
    const verifyInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/payment-intents/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intentId: sessionId })
        })
        const result = await res.json()
        if (result.success && result.status === 'approved') {
          setStatus('success')
          clearInterval(verifyInterval)
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } catch (err) {
        console.error('Error verifying payment:', err)
      }
    }, 3000)

    // 3. Keep realtime updates on payment_intents table as primary mechanism
    const channel = supabase.channel(`intent-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payment_intents', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (payload.new.status === 'approved') {
            setStatus('success')
            clearInterval(verifyInterval)
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(verifyInterval)
      supabase.removeChannel(channel)
    }
  }, [sessionId, router])

  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <Logo className="h-10 w-auto text-ink mb-6" />
        <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} className="text-2xl font-bold text-ink mb-3">
          Sessão Inválida
        </h2>
        <p className="text-sm text-slate mb-8 leading-relaxed">
          Nenhum pagamento foi encontrado nesta URL.
        </p>
        <Link
          href="/dashboard"
          className="bg-ink text-white font-semibold py-3 px-8 rounded-full hover:opacity-85 transition-all"
        >
          Voltar ao painel
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-20 bg-[#fafafa]">
      <div className="mb-8 relative z-10">
        <Logo className="h-10 w-auto text-ink mx-auto" />
      </div>

      <div className="w-full max-w-[600px] relative z-10 flex flex-col items-center text-center">
        {status === 'loading' ? (
          <>
            <div className="w-16 h-16 border-4 border-[#0a0a0a]/20 border-t-[#0a0a0a] rounded-full animate-spin mb-6"></div>
            <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} className="text-2xl font-bold text-ink mb-3">
              Confirmando pagamento...
            </h2>
            <p className="text-sm text-slate mb-8 leading-relaxed max-w-sm">
              Aguarde um instante enquanto verificamos seu pagamento com o Mercado Pago. Esta página atualizará automaticamente.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#4ac550] text-white rounded-full flex items-center justify-center mb-6">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} className="text-2xl font-bold text-ink mb-3">
              Pagamento Confirmado!
            </h2>
            <p className="text-sm text-slate mb-8 leading-relaxed max-w-sm">
              Seu plano foi ativado com sucesso. Você será redirecionado em instantes...
            </p>
          </>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-[#0a0a0a] text-white font-semibold py-4 px-12 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200"
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
        <svg className="animate-spin text-stone-400" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
