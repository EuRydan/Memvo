import { CheckCircle2, TrendingUp, Wallet, HeadphonesIcon } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Custo Zero",
      description: "Você não paga nada para se cadastrar e começar a indicar o Memvor. É 100% gratuito para parceiros.",
      color: "bg-emerald-100 text-emerald-700"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Dashboard em Tempo Real",
      description: "Acompanhe seus cliques, conversões e saldo disponível diretamente no seu painel de parceiro.",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "30% de Comissão",
      description: "Receba 30% do valor de cada plano vendido através do seu link. Pagamentos realizados direto no seu PIX.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" />,
      title: "Suporte Direto",
      description: "Canal exclusivo de atendimento para tirar dúvidas suas e auxiliar na oferta aos seus clientes.",
      color: "bg-amber-100 text-amber-700"
    }
  ]

  return (
    <section className="relative w-full py-24 bg-white z-10 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Vantagens</p>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[2rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">
            Por que ser um parceiro Memvor?
          </h2>
          <p className="mt-4 text-[#676f7b] text-base">
            Desenvolvemos nosso programa de parcerias para ser a forma mais simples e transparente de você aumentar a sua renda mensal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-6 p-8 rounded-3xl bg-[#fafafa] border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${benefit.color}`}>
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">{benefit.title}</h3>
                <p className="text-[#676f7b] leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
