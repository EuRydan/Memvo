'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { initMercadoPago, StatusScreen } from '@mercadopago/sdk-react'

if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' })
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

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

      <div className="w-full max-w-[600px] relative z-10">
        <StatusScreen
          initialization={{ paymentId: sessionId }}
          onReady={() => console.log('Status Screen is ready')}
          onError={(error) => console.error('Erro no Status Screen:', error)}
        />

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-[#0a0a0a] text-white font-semibold py-4 px-12 rounded-full hover:opacity-85 active:scale-95 transition-all duration-200"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.16)' }}
          >
            Ir para o painel
          </Link>
          <p className="mt-4 text-xs text-stone-500 max-w-sm mx-auto">
            Assim que seu pagamento for confirmado, os recursos do seu plano serão desbloqueados automaticamente.
          </p>
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
