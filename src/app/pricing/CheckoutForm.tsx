'use client'

import React, { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'

export default function CheckoutForm({ planId, planPrice, returnUrl }: { planId: string, planPrice: string, returnUrl: string }) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    })

    if (result.error) {
      const { error } = result
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Erro de validação')
      } else {
        setMessage('Ocorreu um erro inesperado.')
      }
    }

    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col w-full h-full">
      {/* Stripe Payment Element */}
      <div className="mb-8 w-full">
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      </div>

      {/* Botão de pagamento */}
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mt-auto block w-full bg-[#0a0a0a] text-white text-center py-4 rounded-full text-[14px] font-semibold tracking-wide hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-50"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
      >
        <span id="button-text">
          {isLoading ? (
            <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            `Pagar ${planPrice} e Continuar`
          )}
        </span>
      </button>

      {/* Mensagens de erro ou aviso */}
      {message && (
        <div id="payment-message" className="mt-4 text-xs text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
          {message}
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2 mt-5 text-[#939393]">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p className="text-[10px] font-medium">Pagamento protegido por criptografia de ponta a ponta.</p>
      </div>
    </form>
  )
}
