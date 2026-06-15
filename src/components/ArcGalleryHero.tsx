'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AwardBadge } from "./ui/award-badge"

// --- The ArcGalleryHero Component ---
type ArcGalleryHeroProps = {
  images: string[];
  startAngle?: number;
  endAngle?: number;
  // radius for different screen sizes
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  // size of each card for different screen sizes
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  // optional extra class on outer section
  className?: string;
};

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 55,
  endAngle = 125,
  radiusLg = 1200,
  radiusMd = 1000,
  radiusSm = 600,
  cardSizeLg = 140,
  cardSizeMd = 120,
  cardSizeSm = 90,
  className = '',
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });

  // Effect to handle responsive resizing of the arc and cards
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  // Ensure at least 2 points to distribute angles for the arc calculation
  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section className={`relative overflow-hidden bg-[#fafafa] pt-20 flex flex-col min-h-[90vh] ${className}`}>
      
      {/* ── Grid Background ── */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)',
          backgroundSize: '6rem 4rem',
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle 800px at 50% 50%, rgba(213,197,255,0.3), transparent)',
        }} />
      </div>

      {/* ── Orbs ── */}
      <div className="absolute top-[10%] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(244,197,168,0.4) 0%, rgba(200,184,224,0.3) 60%, transparent 80%)',
          filter: 'blur(80px)',
          animation: 'drift 20s ease-in-out infinite alternate',
        }} />
      <div className="absolute bottom-[10%] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(186,210,255,0.4) 0%, rgba(200,184,224,0.25) 60%, transparent 80%)',
          filter: 'blur(70px)',
          animation: 'drift2 16s ease-in-out infinite alternate',
        }} />

      {/* Background ring container that controls geometry */}
      <div
        className="relative mx-auto z-10"
        style={{
          width: '100%',
          height: '240px', // Fixed height since we decouple the huge radius
        }}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full">
          {/* Each image is positioned on the circle and rotated to face outward */}
          {images.map((src, i) => {
            const angle = startAngle + step * i; // degrees
            const angleRad = (angle * Math.PI) / 180;
            
            // Calculate x and y positions on the arc
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;
            
            // Peak of the arc is at angle 90 (sin(90) = 1)
            const peakY = dimensions.radius;
            // How far down from the peak is this point?
            const yOffset = peakY - y;
            
            return (
              <div
                key={i}
                className="absolute opacity-0 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  top: `${yOffset}px`,
                  transform: `translate(-50%, -50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'forwards',
                  zIndex: count - i,
                }}
              >
                <div 
                  className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-200/50 bg-white transition-transform hover:scale-110 w-full h-full"
                  style={{ transform: `rotate(12deg)` }}
                >
                  <img
                    src={src}
                    alt={`Memory ${i + 1}`}
                    className="block w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/400x400/334155/e2e8f0?text=Memoria`;
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content positioned below the arc */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 mt-12 pb-24">
        <div className="flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          
          <AwardBadge />
          
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-0 mt-4">
            Para Profissionais de Eventos
          </p>
          
          <h1 
            style={{ fontFamily: 'var(--font-raleway), Georgia, serif', color: '#0a0a0a' }} 
            className="text-[2.5rem] md:text-[3.5rem] font-bold text-center tracking-[-0.02em] leading-tight max-w-3xl"
          >
            Indique o Memvor e ganhe por cada celebração
          </h1>

          <p className="text-[16px] text-[#676f7b] leading-relaxed max-w-lg text-center mb-4">
            Cerimonialistas, fotógrafos e assessores: ofereça uma experiência inovadora para seus clientes e receba <strong className="text-[#0a0a0a]">25% de comissão</strong> por cada plano vendido através do seu link exclusivo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-4">
            <Link 
              href="/parceiros/cadastro"
              className="inline-block bg-[#0a0a0a] text-white text-sm font-bold px-10 py-4 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-xl text-center w-full sm:w-auto"
            >
              Quero ser parceiro
            </Link>
            <a 
              href="https://wa.me/5521978949944" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block border border-black/10 text-[#0a0a0a] text-sm font-bold px-10 py-4 rounded-full hover:bg-black/5 transition-all active:scale-95 text-center w-full sm:w-auto bg-white/40 backdrop-blur-md"
            >
              Falar com a equipe
            </a>
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 50%);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation-name: fade-in-up;
          animation-duration: 0.8s;
          animation-timing-function: ease-out;
        }
        .animate-fade-in {
          animation-name: fade-in;
          animation-duration: 0.8s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </section>
  );
};
