import { Camera, Music, Calendar, Building2 } from "lucide-react"

export function TargetAudience() {
  const audiences = [
    {
      icon: <Calendar className="w-8 h-8 mb-4 text-[#0a0a0a]" />,
      title: "Cerimonialistas",
      description: "Agregue uma atração moderna aos seus pacotes de assessoria."
    },
    {
      icon: <Camera className="w-8 h-8 mb-4 text-[#0a0a0a]" />,
      title: "Fotógrafos",
      description: "Ofereça o Memvor como um complemento interativo à sua cobertura oficial."
    },
    {
      icon: <Building2 className="w-8 h-8 mb-4 text-[#0a0a0a]" />,
      title: "Espaços de Eventos",
      description: "Diferencie seu espaço oferecendo uma experiência tecnológica inclusa."
    },
    {
      icon: <Music className="w-8 h-8 mb-4 text-[#0a0a0a]" />,
      title: "DJs e Bandas",
      description: "Engaje a pista de dança com desafios fotográficos exclusivos."
    }
  ]

  return (
    <section className="relative w-full py-24 bg-[#fafafa] z-10 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#f4c5a8]/20 to-[#c8b8e0]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Público-alvo</p>
          <h2
            className="text-[2rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight font-serif">
            Para quem é a parceria?
          </h2>
          <p className="mt-4 text-[#676f7b] text-base">
            Se você trabalha diretamente com os noivos, debutantes ou formandos na organização de seus eventos, o Memvor é para você.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {audience.icon}
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">{audience.title}</h3>
              <p className="text-[#676f7b] text-sm leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
