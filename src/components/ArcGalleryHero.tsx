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
  startAngle = 10,
  endAngle = 170,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 240,
  cardSizeLg = 140,
  cardSizeMd = 110,
  cardSizeSm = 80,
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
    <section className={`relative overflow-hidden bg-[#fafafa] pt-32 pb-16 flex flex-col min-h-screen ${className}`}>
      
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
          // Give it a bit more height to prevent clipping
          height: dimensions.radius * 1.2,
        }}
      >
        {/* Center pivot for transforms - positioned at bottom center */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
          {/* Each image is positioned on the circle and rotated to face outward */}
          {images.map((src, i) => {
            const angle = startAngle + step * i; // degrees
            const angleRad = (angle * Math.PI) / 180;
            
            // Calculate x and y positions on the arc
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;
            
            return (
              <div
                key={i}
                className="absolute opacity-0 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'forwards',
                  zIndex: count - i,
                }}
              >
                <div 
                  className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-200/50 bg-white transition-transform hover:scale-110 w-full h-full"
                  style={{ transform: `rotate(${(angle - 90) * 0.4}deg)` }}
                >
                  <img
                    src={src}
                    alt={`Memory ${i + 1}`}
                    className="block w-full h-full object-cover"
                    draggable={false}
                    // Add a fallback in case an image fails to load
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
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 -mt-32 md:-mt-40 lg:-mt-48">
        <div className="text-center max-w-4xl px-6 opacity-0 animate-fade-in flex flex-col items-center" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          
          <div className="mb-6">
            <AwardBadge />
          </div>

          <span className="inline-block py-1 px-3 rounded-full bg-[#0a0a0a]/5 border border-[#0a0a0a]/10 text-xs font-semibold tracking-wider text-[#0a0a0a] uppercase mb-4">
            Programa de Parceiros
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight" style={{ fontFamily: 'var(--font-raleway), Georgia, serif' }}>
            Indique o Memvor e ganhe <br/><span className="text-[#676f7b]">por cada celebração.</span>
          </h1>
          <p className="mt-6 text-[16px] text-[#676f7b] max-w-2xl mx-auto leading-relaxed">
            Cerimonialistas, fotógrafos e assessores: ofereça uma experiência inovadora para seus clientes e receba <strong className="text-[#0a0a0a]">25% de comissão</strong> por cada plano vendido através do seu link exclusivo.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/parceiros/cadastro" className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#0a0a0a] text-white font-bold hover:bg-black/80 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
              Quero ser parceiro
            </Link>
            <a href="https://wa.me/5521978949944" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-10 py-4 rounded-full border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/5 font-semibold text-[#0a0a0a] transition-all duration-200 bg-white/40 backdrop-blur-md">
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
