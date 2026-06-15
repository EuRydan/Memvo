"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"
import Link from 'next/link'

export function MeshCTA() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <section className="relative px-6 py-20 overflow-hidden mx-5 mb-10 rounded-[28px] min-h-[400px] flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full bg-[#f4c5a8]">
        {mounted && (
          <>
            {/*
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={["#f4c5a8", "#c8b8e0", "#b8d0f0", "#f4c5a8", "#d4bde8", "#a8c4e0"]}
              distortion={0.5}
              swirl={0.4}
              grainMixer={0}
              grainOverlay={0}
              speed={0.2}
              offsetX={0}
            />
            */}
            <div className="absolute inset-0 pointer-events-none bg-white/10" />
          </>
        )}
      </div>

      <div className="relative z-10 text-center max-w-sm mx-auto">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-white/90 uppercase mb-4 drop-shadow-sm">Comece agora</p>
        <h2 style={{ fontFamily: 'var(--font-raleway), Georgia, serif' }}
          className="text-[2.2rem] font-bold tracking-[-0.02em] text-white leading-tight mb-4 drop-shadow-sm">
          Preserve cada memória preciosa
        </h2>
        <p className="text-[15px] text-white/95 mb-8 leading-relaxed font-medium drop-shadow-sm">
          Crie seu álbum em menos de 2 minutos. Pagamento único, sem assinatura.
        </p>
        <Link href="/pricing"
          className="inline-block bg-white text-[#0a0a0a] text-[15px] font-bold px-9 py-4 rounded-full hover:bg-[#fafafa] transition-all active:scale-95"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          Ver planos e preços
        </Link>
      </div>
    </section>
  )
}
