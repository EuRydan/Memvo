'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
// Import supabase client for fetching the user ID
import { createClient } from '@/lib/supabase/client'

const PACKAGES = {
  pack_5: { name: 'Pacote Starter', count: 5, price: 'R$ 590,00', rawPrice: 590 },
  pack_10: { name: 'Pacote Pro', count: 10, price: 'R$ 990,00', rawPrice: 990 },
  pack_20: { name: 'Pacote Elite', count: 20, price: 'R$ 1.580,00', rawPrice: 1580 }
}

export default function B2BCheckoutPage() {
  const searchParams = useSearchParams()
  const packId = searchParams?.get('pack') || 'pack_10'
  const packInfo = PACKAGES[packId as keyof typeof PACKAGES]

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
  
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Pegar o ID do usuário logado ao carregar a página
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setEmail(user.email || '')
        // Pode buscar o perfil do parceiro também se existir
      }
    }
    getUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      setMessage('Você precisa estar logado para comprar pacotes.')
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/b2b/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack: packId,
          userId,
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
        // Redireciona para o dashboard parceiro
        window.location.href = '/parceiros'
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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
            <p className="text-[#676f7b] mb-6">Você precisa estar logado na sua conta de Cerimonialista para adquirir pacotes.</p>
            <Link href="/login" className="bg-[#0a0a0a] text-white px-6 py-3 rounded-full font-semibold">
              Fazer Login / Criar Conta
            </Link>
          </div>
        ) : pixData ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 text-center animate-fade-in max-w-sm mx-auto">
            <h4 className="text-xl font-bold text-[#0a0a0a] mb-2">Finalize no PIX</h4>
            <p className="text-sm text-[#676f7b] mb-6">Escaneie o QR Code abaixo para pagar seu lote.</p>
            <img src={`data:image/jpeg;base64,${pixData.encodedImage}`} alt="QR Code PIX" className="w-48 h-48 mb-6 mx-auto rounded-xl border border-stone-200 p-2" />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(pixData.payload)
                alert('PIX copiado!')
              }}
              className="w-full bg-stone-100 hover:bg-stone-200 text-[#0a0a0a] font-semibold text-sm px-6 py-3 rounded-full mb-4 transition-colors"
            >
              Copiar código PIX
            </button>
            <p className="text-xs text-[#939393]">
              Suas chaves aparecerão no seu Painel de Parceiros assim que o banco confirmar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[24px] shadow-sm border border-stone-100">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-8">Informações de Pagamento</h2>
            
            <div className="flex bg-stone-100 p-1 rounded-xl mb-8">
              <button type="button" onClick={() => setPaymentMethod('PIX')} className={`flex-1 text-sm font-semibold py-3 rounded-lg transition-all ${paymentMethod === 'PIX' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#676f7b] hover:text-[#0a0a0a]'}`}>
                PIX
              </button>
              <button type="button" onClick={() => setPaymentMethod('CREDIT_CARD')} className={`flex-1 text-sm font-semibold py-3 rounded-lg transition-all ${paymentMethod === 'CREDIT_CARD' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#676f7b] hover:text-[#0a0a0a]'}`}>
                Cartão de Crédito
              </button>
            </div>

            <div className="flex flex-col gap-5 mb-8">
              <div>
                <label className="block text-xs font-semibold text-[#676f7b] mb-1.5">Nome no Documento</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]" placeholder="Seu nome" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#676f7b] mb-1.5">CPF ou CNPJ</label>
                  <input required type="text" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#676f7b] mb-1.5">E-mail</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]" placeholder="seu@email.com" />
                </div>
              </div>

              {paymentMethod === 'CREDIT_CARD' && (
                <>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <label className="block text-xs font-semibold text-[#676f7b] mb-1.5">Número do Cartão</label>
                    <input required type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#676f7b] mb-1.5">Validade</label>
                      <input required type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]" placeholder="MM/AA" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#676f7b] mb-1.5">CVV</label>
                      <input required type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]" placeholder="123" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-[#0a0a0a] text-white py-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? 'Processando...' : `Confirmar Pagamento de ${packInfo.price}`}
            </button>

            {message && (
              <div className="mt-4 text-sm text-red-600 font-semibold text-center bg-red-50 p-4 rounded-xl border border-red-100">
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
