'use client'

import React, { useState } from 'react'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' })
}

export default function CheckoutForm({ planId, planPrice, userId, returnUrl }: { planId: string, planPrice: string, userId: string, returnUrl: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [brickStatus, setBrickStatus] = useState<string>('carregando')
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  
  const numericPrice = parseFloat(planPrice.replace('R$', '').replace(',', '.')) || 0

  const initialization = React.useMemo(() => {
    if (!preferenceId) return undefined;
    return {
      amount: numericPrice,
      preferenceId: preferenceId,
    }
  }, [numericPrice, preferenceId]);

  const customization = React.useMemo(() => ({
    paymentMethods: {
      ticket: 'all',
      bankTransfer: 'all',
      creditCard: 'all',
      mercadoPago: 'all',
    },
  } as any), []);

  React.useEffect(() => {
    async function createPreference() {
      try {
        const response = await fetch('/api/create-payment-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId, userId, price: numericPrice })
        })
        const data = await response.json()
        if (response.ok && data.preferenceId) {
          setPreferenceId(data.preferenceId)
        } else {
          console.error(data.error)
          setBrickStatus('erro')
        }
      } catch (err) {
        console.error(err)
        setBrickStatus('erro')
      }
    }
    
    if (userId) {
      createPreference()
    }
  }, [planId, userId, numericPrice])

  // Voucher state
  const [useVoucher, setUseVoucher] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, plan: planId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao validar código')
      
      window.location.href = returnUrl
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      {useVoucher ? (
        <form onSubmit={handleVoucherSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center items-center py-8">
            <label className="block text-sm font-semibold text-[#676f7b] mb-4 text-center">Digite o código fornecido pelo seu Cerimonialista/Parceiro</label>
            <input required type="text" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} className="w-full text-center bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-xl font-bold tracking-widest focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/20 transition-all" placeholder="aBcD1234XYZ" />
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
                'Ativar Evento Gratuitamente'
              )}
            </span>
          </button>
        </form>
      ) : (
        <div className="flex-1 min-h-[400px]">
           {!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ? (
             <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl mt-4">
               Erro: Chave pública do Mercado Pago não encontrada. Certifique-se de configurar o arquivo .env.local e reiniciar o servidor.
             </div>
           ) : (
             <>
               {brickStatus === 'carregando' && (
                 <div className="flex flex-col items-center justify-center h-48 space-y-4">
                   <div className="w-8 h-8 border-4 border-[#0a0a0a]/20 border-t-[#0a0a0a] rounded-full animate-spin"></div>
                   <p className="text-sm text-stone-500 font-medium">Conectando ao Mercado Pago...</p>
                 </div>
               )}
               {brickStatus === 'erro' && (
                 <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl mt-4">
                   Erro ao conectar com o Mercado Pago. Verifique sua conexão ou tente recarregar a página.
                 </div>
               )}
               {preferenceId && (
                 <div style={{ display: brickStatus === 'erro' ? 'none' : 'block' }}>
                   <Payment
                      initialization={initialization!}
                      customization={customization}
                      onSubmit={async ({ selectedPaymentMethod, formData }: any) => {
                        return new Promise<void>((resolve, reject) => {
                          fetch('/api/process-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ formData, userId, planId })
                          })
                          .then(res => res.json())
                          .then(data => {
                            if (data.success && data.paymentId) {
                              const separator = returnUrl.includes('?') ? '&' : '?';
                              window.location.href = `${returnUrl}${separator}session_id=${data.paymentId}`;
                              resolve();
                            } else {
                              console.error(data.error);
                              setBrickStatus('erro');
                              reject();
                            }
                          })
                          .catch(err => {
                            console.error(err);
                            setBrickStatus('erro');
                            reject();
                          });
                        });
                      }}
                      onError={(error) => {
                        console.error('Erro no Checkout Brick:', error);
                        setBrickStatus('erro');
                        setMessage('Não foi possível carregar as opções de pagamento.');
                      }}
                      onReady={() => {
                        setBrickStatus('pronto');
                      }}
                   />
                 </div>
               )}
             </>
           )}
        </div>
      )}

      {message && (
        <div className="mt-4 text-xs text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
          {message}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center gap-3 mt-5">
        <button 
          type="button" 
          onClick={() => {
             setUseVoucher(!useVoucher);
             setMessage(null);
          }}
          className="text-xs font-semibold text-[#0a0a0a] underline decoration-stone-300 hover:decoration-[#0a0a0a] transition-all"
        >
          {useVoucher ? 'Voltar para Pagamento Tradicional' : 'Tenho um código de parceiro/cerimonialista'}
        </button>
        
        {!useVoucher && (
          <div className="flex items-center gap-2 text-[#939393]">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <p className="text-[10px] font-medium">Pagamento processado com segurança pelo Mercado Pago.</p>
          </div>
        )}
      </div>
    </div>
  )
}
