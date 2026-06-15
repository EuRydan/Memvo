"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function ParceirosFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Como recebo minha comissão?",
      answer: "Assim que a venda é confirmada pelo seu link, a comissão fica disponível no seu painel. Os saques são realizados via PIX em até 7 dias após a confirmação do pagamento do cliente."
    },
    {
      question: "O que acontece se o cliente cancelar ou pedir reembolso?",
      answer: "A transparência é fundamental para nós. Caso o cliente solicite reembolso dentro do prazo de garantia de 7 dias, a comissão correspondente será estornada do seu painel. Após esse período, sua comissão está 100% garantida."
    },
    {
      question: "Como os noivos sabem que a indicação é minha?",
      answer: "Você receberá um link único e exclusivo (ex: memvor.com/p/seunome). Quando o cliente acessa através desse link, nosso sistema registra automaticamente que a indicação foi sua, e a comissão é atrelada a você no momento da compra."
    },
    {
      question: "Existe um limite de indicações?",
      answer: "Não há limite! Quanto mais você indicar, mais você ganha. Não limitamos o número de clientes que você pode trazer para a plataforma."
    },
    {
      question: "A comissão vale para renovações ou upgrades?",
      answer: "A comissão de 30% é aplicada sobre o valor do plano contratado inicialmente através da sua indicação para aquele evento."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative w-full py-24 bg-[#fafafa] z-10 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Dúvidas Frequentes</p>
          <h2 style={{ fontFamily: 'var(--font-raleway), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-semibold text-[#0a0a0a]">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#676f7b] transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-[#676f7b] text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
