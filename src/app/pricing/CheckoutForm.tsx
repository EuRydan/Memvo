'use client'

import React, { useState } from 'react'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' })
}

export default function CheckoutForm({ intentId, preferenceId, userId, returnUrl }: { intentId: string, preferenceId: string, userId: string, returnUrl: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [brickStatus, setBrickStatus] = useState<string>('carregando')
  const [amount, setAmount] = useState<number>(0)
  
  const initialization = React.useMemo(() => {
    if (!preferenceId || !amount) return undefined;
    return {
      amount: amount,
      preferenceId: preferenceId,
    }
  }, [amount, preferenceId]);

  const customization = React.useMemo(() => ({
    paymentMethods: {
      ticket: 'all',
      bankTransfer: 'all',
      creditCard: 'all',
      mercadoPago: 'all',
    },
  } as any), []);

  React.useEffect(() => {
    async function fetchIntent() {
      try {
        const response = await fetch(`/api/payment-intents/${intentId}`)
        const data = await response.json()
        if (response.ok && data.intent) {
          setAmount(Number(data.intent.amount))
        } else {
          console.error(data.error)
          setBrickStatus('erro')
        }
      } catch (err) {
        console.error(err)
        setBrickStatus('erro')
      }
    }
    
    if (intentId) {
      fetchIntent()
    }
  }, [intentId])



  return (
    <div className="flex flex-col w-full h-full">
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
                            body: JSON.stringify({ formData, intentId })
                          })
                          .then(res => res.json())
                          .then(data => {
                            if (data.success && data.paymentId) {
                              if (data.status === 'rejected') {
                                console.error('Pagamento recusado:', data.status_detail);
                                setBrickStatus('erro');
                                setMessage('Pagamento recusado. Por favor, tente outro cartão.');
                                reject();
                              } else {
                                const separator = returnUrl.includes('?') ? '&' : '?';
                                window.location.href = `${returnUrl}${separator}session_id=${data.paymentId}`;
                                resolve();
                              }
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

      {message && (
        <div className="mt-4 text-xs text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
          {message}
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2 text-[#939393] mt-5">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p className="text-[10px] font-medium">Pagamento processado com segurança pelo Mercado Pago.</p>
      </div>
    </div>
  )
}
