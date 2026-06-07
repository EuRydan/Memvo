'use client'

import React, { useState } from 'react'

export default function CheckoutForm({ planId, planPrice, returnUrl }: { planId: string, planPrice: string, returnUrl: string }) {
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX')
  
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const [pixData, setPixData] = useState<{ encodedImage: string, payload: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          paymentMethod,
          customer: { name, cpf, email },
          card: paymentMethod === 'CREDIT_CARD' ? {
            holderName: name,
            number: cardNumber.replace(/\D/g, ''),
            expiryMonth: cardExpiry.split('/')[0]?.trim(),
            expiryYear: cardExpiry.split('/')[1]?.trim(),
            ccv: cardCvv,
          } : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      if (paymentMethod === 'PIX' && data.pix) {
        setPixData(data.pix)
      } else if (paymentMethod === 'CREDIT_CARD') {
        // Redireciona para sucesso
        window.location.href = returnUrl
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPix = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload)
      alert('Código PIX copiado!')
    }
  }

  if (pixData) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in w-full h-full">
        <h4 className="text-lg font-bold text-[#0a0a0a] mb-2">Pague com PIX</h4>
        <p className="text-sm text-[#676f7b] mb-6">Escaneie o QR Code abaixo ou copie o código PIX.</p>
        
        <img src={`data:image/jpeg;base64,${pixData.encodedImage}`} alt="QR Code PIX" className="w-48 h-48 mb-6 rounded-xl border border-stone-200 p-2" />
        
        <button 
          onClick={handleCopyPix}
          className="bg-stone-100 hover:bg-stone-200 text-[#0a0a0a] font-semibold text-sm px-6 py-3 rounded-full mb-6 transition-colors"
        >
          Copiar código PIX
        </button>

        <p className="text-xs text-[#939393]">
          Após o pagamento, você receberá a confirmação no seu e-mail.
        </p>
      </div>
    )
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col w-full h-full">
      
      {/* Abas de método de pagamento */}
      <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
        <button type="button" onClick={() => setPaymentMethod('PIX')} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${paymentMethod === 'PIX' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#676f7b] hover:text-[#0a0a0a]'}`}>
          PIX
        </button>
        <button type="button" onClick={() => setPaymentMethod('CREDIT_CARD')} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${paymentMethod === 'CREDIT_CARD' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#676f7b] hover:text-[#0a0a0a]'}`}>
          Cartão de Crédito
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 mb-6" style={{ maxHeight: '400px' }}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#676f7b] mb-1">Nome Completo</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all" placeholder="Como no documento" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#676f7b] mb-1">CPF</label>
              <input required type="text" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#676f7b] mb-1">E-mail</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all" placeholder="seu@email.com" />
            </div>
          </div>

          {paymentMethod === 'CREDIT_CARD' && (
            <>
              <div className="mt-2 pt-4 border-t border-stone-100">
                <label className="block text-xs font-semibold text-[#676f7b] mb-1">Número do Cartão</label>
                <input required type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#676f7b] mb-1">Validade</label>
                  <input required type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all" placeholder="MM/AA" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#676f7b] mb-1">CVV</label>
                  <input required type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all" placeholder="123" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="mt-auto block w-full bg-[#0a0a0a] text-white text-center py-4 rounded-full text-[14px] font-semibold tracking-wide hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-50"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
      >
        <span>
          {isLoading ? (
            <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            `Pagar ${planPrice} com ${paymentMethod === 'PIX' ? 'PIX' : 'Cartão'}`
          )}
        </span>
      </button>

      {message && (
        <div className="mt-4 text-xs text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
          {message}
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2 mt-5 text-[#939393]">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p className="text-[10px] font-medium">Pagamento processado com segurança pelo Asaas.</p>
      </div>
    </form>
  )
}
