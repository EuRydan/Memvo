'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' })
}
const PACKAGES = {
  pack_5: { name: 'Pacote Starter', count: 5, price: 'R$ 590,00', rawPrice: 590 },
  pack_10: { name: 'Pacote Pro', count: 10, price: 'R$ 990,00', rawPrice: 990 },
  pack_20: { name: 'Pacote Elite', count: 20, price: 'R$ 1.580,00', rawPrice: 1580 }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const packId = searchParams?.get('pack') || 'pack_10'
  const packInfo = PACKAGES[packId as keyof typeof PACKAGES]

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [brickStatus, setBrickStatus] = useState<string>('carregando')
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserRole(user.user_metadata?.role || 'host')
      }
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    async function createPreference() {
      try {
        const response = await fetch('/api/create-payment-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: `b2b_${packId}`, userId, price: packInfo.rawPrice })
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
    
    if (userId && userRole === 'partner' && packInfo) {
      createPreference()
    }
  }, [packId, userId, userRole, packInfo])

  if (!packInfo) return <div className="p-10 text-center">Pacote não encontrado.</div>

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row">
      {/* Left side: Resume */}
      <div className="md:w-1/3 bg-white p-10 border-r border-stone-200 flex flex-col">
        <Link href="/cerimonialistas" className="mb-12 inline-block">
          <Logo className="h-6 w-auto text-[#0a0a0a]" />
        </Link>
        <div className="mb-6">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-[#0a0a0a] text-white px-2 py-1 rounded-md">B2B Checkout</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Seu Pacote: {packInfo.name}</h1>
        <p className="text-[#676f7b] mb-8">Você receberá {packInfo.count} chaves de ativação únicas no seu painel.</p>

        <div className="bg-stone-50 border border-stone-100 rounded-xl p-6 mt-auto">
          <div className="flex justify-between items-center mb-4 text-sm font-medium">
            <span className="text-[#676f7b]">{packInfo.count}x Eventos Clássicos</span>
            <span className="text-[#0a0a0a]">{packInfo.price}</span>
          </div>
          <div className="pt-4 border-t border-stone-200 flex justify-between items-center font-bold text-lg">
            <span className="text-[#0a0a0a]">Total</span>
            <span className="text-[#0a0a0a]">{packInfo.price}</span>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="md:w-2/3 p-10 md:p-20 flex flex-col justify-center max-w-3xl">
        {!userId ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-stone-100">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-[#676f7b] mb-6">Você precisa estar logado na sua conta de Parceiro/Cerimonialista para adquirir pacotes.</p>
            <Link href="/login" className="bg-[#0a0a0a] text-white px-6 py-3 rounded-full font-semibold">
              Fazer Login / Criar Conta
            </Link>
          </div>
        ) : userRole !== 'partner' ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-stone-100">
            <div className="text-4xl mb-4">🚫</div>
            <h2 className="text-xl font-bold mb-2">Conta Não Autorizada</h2>
            <p className="text-[#676f7b] mb-6">Sua conta está cadastrada como Anfitrião. Apenas Parceiros credenciados podem comprar pacotes B2B.</p>
            <Link href="/dashboard" className="bg-stone-100 hover:bg-stone-200 text-[#0a0a0a] px-6 py-3 rounded-full font-semibold transition-colors">
              Voltar ao Meu Painel
            </Link>
          </div>
        ) : (
          <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-sm border border-stone-100">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-8">Informações de Pagamento</h2>
            
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
                      initialization={{
                        preferenceId: preferenceId,
                      }}
                      customization={{
                        paymentMethods: {
                          ticket: 'all',
                          bankTransfer: 'all',
                          creditCard: 'all',
                          mercadoPago: 'all',
                        },
                      }}
                      onSubmit={async () => {
                        // Com a preferência, o Mercado Pago resolve o pagamento e chama o webhook.
                        // O brick lida com sucesso automaticamente na tela ou redireciona.
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

            {isLoading && <p className="text-center text-sm text-stone-500 mt-4">Processando...</p>}

            {message && (
              <div className="mt-4 text-sm text-red-600 font-semibold text-center bg-red-50 p-4 rounded-xl border border-red-100">
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function B2BCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center">Carregando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
