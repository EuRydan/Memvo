"use client";

import { QrCode, Zap, Target, Download, Unlock, Smartphone } from 'lucide-react'
import { ServiceCarousel } from '@/components/ui/animated-service-card'

export function FeaturesSection() {
  const services = [
    { number: '01', icon: <QrCode className="w-full h-full" />, title: 'Link & QR Code', description: 'Compartilhe por qualquer canal', gradient: 'from-[#f4c5a8] to-[#e8b898]' },
    { number: '02', icon: <Zap className="w-full h-full" />, title: 'Tempo real', description: 'Fotos aparecem instantaneamente', gradient: 'from-[#c8b8e0] to-[#b8a8d0]' },
    { number: '03', icon: <Target className="w-full h-full" />, title: 'Desafios', description: 'Missões para engajar convidados', gradient: 'from-[#b8d4f0] to-[#a8c4e0]' },
    { number: '04', icon: <Download className="w-full h-full" />, title: 'Download', description: 'Baixe todas as fotos em HD', gradient: 'from-[#f4c5a8]/80 to-[#e8b898]/80' },
    { number: '05', icon: <Unlock className="w-full h-full" />, title: 'Sem login', description: 'Convidados enviam sem cadastro', gradient: 'from-[#c8b8e0]/80 to-[#b8a8d0]/80' },
    { number: '06', icon: <Smartphone className="w-full h-full" />, title: 'Mobile first', description: 'Funciona em qualquer celular', gradient: 'from-[#b8d4f0]/80 to-[#a8c4e0]/80' },
  ];

  return (
    <section className="py-16 w-full max-w-6xl mx-auto overflow-hidden">
      <div className="text-center mb-10 px-6 max-w-lg mx-auto">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase mb-3">Recursos</p>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          className="text-[1.9rem] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">
          Tudo que você precisa
        </h2>
      </div>
      <ServiceCarousel services={services} />
    </section>
  );
}
