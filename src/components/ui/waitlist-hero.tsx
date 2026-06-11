"use client"

import Link from "next/link"

export const WaitlistHero = () => {
  // Color tokens
  const colors = {
    textMain: "#ffffff",
    textSecondary: "#94a3b8",
    bluePrimary: "#0a0a0a", // Changed to our dark theme
    baseBg: "#fafafa", // Light theme background instead of black
    inputShadow: "rgba(0, 0, 0, 0.1)",
  }

  return (
    <div className="w-full min-h-[90vh] bg-[#fafafa] flex items-center justify-center relative pt-20">
      {/* Animation Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 60s linear infinite;
        }
      `}</style>

      {/* Main Container */}
      <div
        className="relative w-full h-[90vh] overflow-hidden"
        style={{
          backgroundColor: colors.baseBg,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Background Decorative Layer */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(15deg)",
            transformOrigin: "center bottom",
            opacity: 1,
          }}
        >
          {/* Image 3 (Back) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "2000px",
                height: "2000px",
                transform: "translate(-50%, -50%) rotate(279.05deg)",
                zIndex: 0,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1731596153022-4cedafe3330a?w=2400&q=100&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover opacity-20 rounded-[100px]"
              />
            </div>
          </div>

          {/* Image 2 (Middle) - spins counter-clockwise */}
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "1000px",
                height: "1000px",
                transform: "translate(-50%, -50%) rotate(304.42deg)",
                zIndex: 1,
              }}
            >
              <img
                src="https://images.pexels.com/photos/17931371/pexels-photo-17931371.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt=""
                className="w-full h-full object-cover opacity-30 rounded-[80px]"
              />
            </div>
          </div>

          {/* Image 1 (Front) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "800px",
                height: "800px",
                transform: "translate(-50%, -50%) rotate(48.33deg)",
                zIndex: 2,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1723373457175-31b09fa7d405?w=800&h=600&fit=crop&q=80"
                alt="Memórias"
                className="w-full h-full object-cover opacity-40 rounded-[60px]"
              />
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${colors.baseBg} 20%, rgba(250, 250, 250, 0.6) 50%, transparent 100%)`,
          }}
        />

        {/* Content Container */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-end pb-24 gap-6 px-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-0">Para Profissionais de Eventos</p>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0a0a0a' }} className="text-[2.5rem] md:text-[3.5rem] font-bold text-center tracking-[-0.02em] leading-tight max-w-3xl">
            Indique o Memvor e ganhe por cada celebração
          </h1>

          <p className="text-[16px] text-[#676f7b] leading-relaxed max-w-lg text-center mb-4">
            Cerimonialistas, fotógrafos e assessores: ofereça uma experiência inovadora para seus clientes e receba <strong>30% de comissão</strong> por cada plano vendido através do seu link exclusivo.
          </p>

          <Link href="/parceiros/cadastro"
            className="inline-block bg-[#0a0a0a] text-white text-sm font-bold px-10 py-4 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-xl">
            Quero ser parceiro
          </Link>
        </div>
      </div>
    </div>
  )
}
