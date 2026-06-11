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
                width: "1600px",
                height: "1600px",
                transform: "translate(-50%, -50%)",
                zIndex: 0,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const r = 700;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                const images = [
                  "https://images.unsplash.com/photo-1731596153022-4cedafe3330a?w=400&q=80",
                  "https://images.pexels.com/photos/17931371/pexels-photo-17931371.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1723373457175-31b09fa7d405?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1595877786462-ea6dc03f1695?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1628551019393-46e6a870b94b?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1633657322446-ed5784d121e4?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=400&fit=crop&q=80",
                ];
                return (
                  <div key={i} className="absolute rounded-xl overflow-hidden shadow-md opacity-30"
                    style={{
                      width: '50px', height: '50px',
                      left: `calc(50% + ${x}px - 25px)`,
                      top: `calc(50% + ${y}px - 25px)`,
                      transform: `rotate(${i * 30}deg)`,
                    }}>
                    <img src={images[i % images.length]} className="w-full h-full object-cover" alt="" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Image 2 (Middle) - spins counter-clockwise */}
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "1200px",
                height: "1200px",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2 + 0.5;
                const r = 450;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                const images = [
                  "https://images.unsplash.com/photo-1633657322446-ed5784d121e4?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1731596153022-4cedafe3330a?w=400&q=80",
                  "https://images.pexels.com/photos/17931371/pexels-photo-17931371.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1723373457175-31b09fa7d405?w=400&h=400&fit=crop&q=80",
                ];
                return (
                  <div key={i} className="absolute rounded-2xl overflow-hidden shadow-lg opacity-50"
                    style={{
                      width: '70px', height: '70px',
                      left: `calc(50% + ${x}px - 35px)`,
                      top: `calc(50% + ${y}px - 35px)`,
                      transform: `rotate(${i * 45 - 20}deg)`,
                    }}>
                    <img src={images[i % images.length]} className="w-full h-full object-cover" alt="" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Image 1 (Front) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "800px",
                height: "800px",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const angle = (i / 5) * Math.PI * 2;
                const r = 250;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                const images = [
                  "https://images.unsplash.com/photo-1723373457175-31b09fa7d405?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1595877786462-ea6dc03f1695?w=400&h=400&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1628551019393-46e6a870b94b?w=400&h=400&fit=crop&q=80",
                ];
                return (
                  <div key={i} className="absolute rounded-3xl overflow-hidden shadow-xl opacity-90"
                    style={{
                      width: '100px', height: '100px',
                      left: `calc(50% + ${x}px - 50px)`,
                      top: `calc(50% + ${y}px - 50px)`,
                      transform: `rotate(${i * 72 + 15}deg)`,
                    }}>
                    <img src={images[i % images.length]} className="w-full h-full object-cover" alt="" />
                  </div>
                )
              })}
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
