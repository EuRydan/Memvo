"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Download, Heart, Image as ImageIcon, QrCode, Camera as CameraIcon, Share2, Upload } from "lucide-react";

interface MockScreensProps {
  perspective: "anfitriao" | "convidado";
  step: number;
}

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full w-full bg-[#FAF7F2] flex flex-col font-[family-name:var(--font-dm-sans)] text-[#1C1410] relative overflow-hidden rounded-[40px]">
    {/* Status Bar */}
    <div className="flex justify-between items-center px-6 pt-5 pb-2 text-[11px] font-medium text-[#8B6B47] z-50 relative bg-gradient-to-b from-[#FAF7F2] to-transparent">
      <span>9:41</span>
      <div className="flex gap-1.5 items-center">
        {/* Signal */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M0 10H2V7H0V10ZM4 10H6V5H4V10ZM8 10H10V3H8V10ZM12 10H14V0H12V10Z"/></svg>
        {/* Wifi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10Z"/><path d="M7 2C4.23858 2 1.73858 3.11929 0 4.92893L1.41421 6.34315C2.81304 4.88562 4.79255 4 7 4C9.20745 4 11.187 4.88562 12.5858 6.34315L14 4.92893C12.2614 3.11929 9.76142 2 7 2Z"/></svg>
        {/* Battery */}
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor"><rect x="1" y="1" width="18" height="8" rx="2" strokeWidth="1.5"/><path d="M21 4V6" strokeWidth="1.5" strokeLinecap="round"/><rect x="3" y="3" width="14" height="4" rx="1" fill="currentColor"/></svg>
      </div>
    </div>
    <div className="flex-1 overflow-hidden relative">
      {children}
    </div>
  </div>
);

// --- HOST SCREENS ---

const HostScreen0 = () => (
  <div className="px-5 pt-8 pb-4 h-full flex flex-col">
    <h1 className="font-[family-name:var(--font-cormorant)] text-[28px] leading-tight font-semibold mb-6">Criar novo álbum</h1>
    
    <div className="flex-1 space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-[#8B6B47] mb-1.5">Nome do evento</label>
        <div className="bg-[#E8DDD0]/50 rounded-xl px-4 py-3 text-[15px]">Casamento Ana & Pedro 💍</div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#8B6B47] mb-1.5">Data</label>
        <div className="bg-[#E8DDD0]/50 rounded-xl px-4 py-3 text-[15px]">14 de dezembro de 2024</div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#8B6B47] mb-2.5">Tema visual</label>
        <div className="flex gap-3">
          <div className="h-20 flex-1 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center">Classic</div>
          <div className="h-20 flex-1 rounded-xl bg-[#C4956A] text-white border-2 border-[#1C1410] flex items-center justify-center font-medium shadow-sm">Golden</div>
          <div className="h-20 flex-1 rounded-xl bg-[#E8DDD0]/50 border border-[#E8DDD0] flex items-center justify-center">Bloom</div>
        </div>
      </div>
    </div>

    <button className="w-full bg-[#C4956A] text-white rounded-xl py-3.5 font-semibold text-[15px] shadow-lg shadow-[#C4956A]/20">
      Criar Álbum
    </button>
  </div>
);

const HostScreen1 = () => (
  <div className="px-5 pt-6 pb-6 h-full flex flex-col items-center">
    <div className="w-full flex justify-between items-center mb-10">
      <div className="w-8 h-8" />
      <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold">Ana & Pedro</span>
      <div className="w-8 h-8 rounded-full bg-[#E8DDD0]/50 flex items-center justify-center"><Share2 size={16} className="text-[#8B6B47]" /></div>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-black/5 flex flex-col items-center w-full max-w-[260px] border border-[#E8DDD0]/50">
      <QrCode size={160} strokeWidth={1} className="text-[#1C1410]" />
      <p className="text-center text-[#8B6B47] text-[13px] mt-6 px-2">Aponte a câmera para enviar suas fotos para o álbum</p>
    </div>
    
    <div className="mt-8 flex items-center gap-2 bg-[#E8DDD0]/40 px-4 py-2 rounded-full text-sm font-medium text-[#8B6B47]">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Álbum ativo
    </div>

    <div className="mt-auto w-full flex gap-3">
      <button className="flex-1 bg-white border border-[#E8DDD0] text-[#1C1410] rounded-xl py-3 font-semibold text-sm">
        Imprimir
      </button>
      <button className="flex-1 bg-[#C4956A] text-white rounded-xl py-3 font-semibold text-sm">
        Baixar QR
      </button>
    </div>
  </div>
);

const HostScreen2 = () => {
  const [showNew, setShowNew] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setShowNew(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-4 bg-white border-b border-[#E8DDD0]/50">
        <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-center">Ana & Pedro</h2>
        <p className="text-center text-[12px] text-[#8B6B47] mt-0.5">47 fotos · 12 convidados</p>
      </div>
      
      <div className="flex-1 p-2 grid grid-cols-2 gap-2 overflow-hidden bg-white">
        {/* Placeholder images from Unsplash */}
        <div className="rounded-xl bg-gray-200 overflow-hidden relative">
           <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80" className="object-cover w-full h-full" alt="1" />
        </div>
        <div className="rounded-xl bg-gray-200 overflow-hidden relative">
           <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80" className="object-cover w-full h-full" alt="2" />
        </div>
        <div className="rounded-xl bg-gray-200 overflow-hidden relative">
           <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80" className="object-cover w-full h-full" alt="3" />
        </div>
        
        {/* Incoming photo */}
        <AnimatePresence>
          {showNew && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl bg-gray-200 overflow-hidden relative shadow-lg ring-2 ring-[#C4956A]"
            >
              <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80" className="object-cover w-full h-full" alt="new" />
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md rounded-full px-2 py-1 text-[10px] text-white">Agora</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C1410] text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center gap-2"
          >
            <CameraIcon size={14} className="text-[#C4956A]" /> +1 nova foto
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HostScreen3 = () => (
  <div className="h-full flex flex-col bg-white">
    <div className="px-5 pt-4 pb-4">
      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-bold">Ana & Pedro</h2>
      <p className="text-[13px] text-[#8B6B47] mt-1">14 dez 2024 · 142 fotos</p>
    </div>
    
    <div className="flex-1 overflow-hidden px-4 pb-20">
      <div className="columns-2 gap-3 space-y-3">
        <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80" className="w-full rounded-2xl mb-3" alt="" />
        <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80" className="w-full rounded-2xl mb-3 aspect-[3/4] object-cover" alt="" />
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80" className="w-full rounded-2xl mb-3 aspect-square object-cover" alt="" />
        <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80" className="w-full rounded-2xl mb-3" alt="" />
        <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80" className="w-full rounded-2xl mb-3" alt="" />
      </div>
    </div>

    {/* Fake Tab Bar */}
    <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-[#E8DDD0] rounded-2xl flex justify-around items-center py-3 px-2 shadow-lg">
      <div className="flex flex-col items-center gap-1 text-[#C4956A]"><ImageIcon size={20} /><span className="text-[10px] font-medium">Álbum</span></div>
      <div className="flex flex-col items-center gap-1 text-[#8B6B47] opacity-60"><Heart size={20} /><span className="text-[10px] font-medium">Favoritos</span></div>
      <div className="flex flex-col items-center gap-1 text-[#8B6B47] opacity-60"><Share2 size={20} /><span className="text-[10px] font-medium">Compartilhar</span></div>
      <div className="flex flex-col items-center gap-1 text-[#8B6B47] opacity-60"><Download size={20} /><span className="text-[10px] font-medium">Baixar</span></div>
    </div>
  </div>
);

const HostScreen4 = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current > 100) {
          clearInterval(interval);
          setProgress(100);
        } else {
          setProgress(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full px-5 pt-12 pb-8 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-[#E8DDD0]/30 flex items-center justify-center mb-6 relative">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#E8DDD0" strokeWidth="4" />
          <motion.circle 
            cx="50" cy="50" r="46" fill="none" stroke="#C4956A" strokeWidth="4"
            strokeDasharray="289"
            strokeDashoffset={289 - (progress / 100) * 289}
            strokeLinecap="round"
          />
        </svg>
        {progress === 100 ? (
          <Check size={32} className="text-[#C4956A]" />
        ) : (
          <Download size={32} className="text-[#C4956A]" />
        )}
      </div>

      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-bold mb-2">
        {progress === 100 ? "Download Concluído!" : "Baixando memórias..."}
      </h2>
      <p className="text-[#8B6B47] text-[15px] mb-10">
        {progress === 100 ? "142 fotos salvas na galeria" : `${progress}% processado`}
      </p>

      <AnimatePresence>
        {progress === 100 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3 mt-auto">
            <button className="w-full bg-[#C4956A] text-white rounded-xl py-3.5 font-semibold text-[15px]">
              Abrir pasta de fotos
            </button>
            <button className="w-full bg-white border border-[#E8DDD0] text-[#1C1410] rounded-xl py-3.5 font-semibold text-[15px]">
              Compartilhar link da nuvem
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- GUEST SCREENS ---

const GuestScreen0 = () => (
  <div className="h-full w-full bg-black relative">
    <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale" alt="" />
    
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="relative w-56 h-56">
        {/* Animated Scanner Frame */}
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 border-2 border-white/50 rounded-3xl" 
        />
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl" />
        
        {/* Fake QR code in the middle */}
        <div className="absolute inset-6 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
           <QrCode size={100} strokeWidth={1} className="text-white/80" />
        </div>
      </div>
      <p className="text-white font-medium mt-10 text-[15px] bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
        Aponte para o QR Code
      </p>
    </div>
  </div>
);

const GuestScreen1 = () => (
  <div className="h-full px-6 pt-16 pb-8 flex flex-col items-center">
    <div className="w-16 h-16 rounded-2xl bg-[#E8DDD0]/50 mb-6 flex items-center justify-center">
      <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold">M</span>
    </div>
    
    <h1 className="font-[family-name:var(--font-cormorant)] text-[28px] font-bold text-center leading-tight mb-2">
      Casamento<br/>Ana & Pedro
    </h1>
    <p className="text-[#8B6B47] text-sm text-center mb-10">14 dez 2024 · Espaço das Flores</p>

    <div className="w-full space-y-4 mb-auto">
      <div>
        <label className="block text-[13px] font-medium text-[#8B6B47] mb-2 text-center">Como você quer ser chamado?</label>
        <input 
          disabled
          value="Mariana"
          className="w-full bg-white border border-[#E8DDD0] rounded-xl px-4 py-3.5 text-center text-lg font-medium outline-none text-[#1C1410]" 
        />
      </div>
      <button className="w-full bg-[#1C1410] text-white rounded-xl py-3.5 font-semibold text-[15px]">
        Entrar no álbum →
      </button>
    </div>

    <p className="text-center text-[11px] text-[#8B6B47] opacity-60">Sem cadastro · Sem senha · 100% Grátis</p>
  </div>
);

const GuestScreen2 = () => (
  <div className="h-full flex flex-col bg-white">
    <div className="px-5 pt-4 pb-4 flex justify-between items-center border-b border-[#E8DDD0]/50">
      <span className="font-medium text-[15px]">Enviar Foto</span>
      <button className="text-[#C4956A] text-[13px] font-bold">Cancelar</button>
    </div>

    <div className="flex-1 p-5 overflow-hidden flex flex-col">
      <div className="flex-1 rounded-2xl bg-gray-100 overflow-hidden relative mb-5">
        <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80" className="object-cover w-full h-full" alt="selected" />
      </div>

      <div className="bg-[#FAF7F2] rounded-xl p-3 mb-6">
        <input disabled value="Parabéns! Que festa incrível! 🎉" className="w-full bg-transparent text-[14px] outline-none text-[#1C1410]" />
      </div>

      <div className="flex gap-3">
        <button className="h-14 w-14 rounded-xl bg-[#E8DDD0]/50 text-[#1C1410] flex items-center justify-center flex-shrink-0">
          <ImageIcon size={24} />
        </button>
        <button className="flex-1 bg-[#C4956A] text-white rounded-xl h-14 flex items-center justify-center font-semibold text-[15px] gap-2 shadow-lg shadow-[#C4956A]/20">
          <Upload size={18} /> Enviar para o álbum
        </button>
      </div>
    </div>
  </div>
);

const GuestScreen3 = () => (
  <div className="h-full px-6 flex flex-col items-center justify-center bg-[#C4956A]">
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Check size={40} className="text-[#C4956A]" strokeWidth={3} />
      </motion.div>
    </motion.div>

    <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-bold text-white text-center mb-2">
      Foto enviada!
    </h2>
    <p className="text-white/80 text-center text-[15px] mb-12">
      Sua memória já está no álbum dos noivos.
    </p>

    <div className="bg-white/10 p-2 rounded-2xl w-full max-w-[200px] mb-12">
      <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80" className="w-full aspect-square object-cover rounded-xl" alt="" />
    </div>

    <button className="text-white font-semibold flex items-center gap-2">
      Ver álbum completo →
    </button>
  </div>
);

const GuestScreen4 = () => (
  <div className="h-full flex flex-col bg-[#FAF7F2]">
    <div className="px-5 pt-4 pb-4 border-b border-[#E8DDD0]/50 flex justify-between items-center bg-white sticky top-0 z-10">
      <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-bold">Ana & Pedro</h2>
      <div className="bg-[#E8DDD0]/50 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#8B6B47]">
        143 fotos
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      {/* Feed Item 1 */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#C4956A] text-white flex items-center justify-center text-xs font-bold">M</div>
          <div>
            <p className="text-sm font-bold">Mariana</p>
            <p className="text-[10px] text-[#8B6B47]">Agora mesmo</p>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80" className="w-full aspect-[4/5] object-cover rounded-2xl mb-3" alt="" />
        <div className="flex gap-4 px-1">
          <Heart size={22} className="text-[#1C1410]" />
          <Download size={22} className="text-[#1C1410]" />
        </div>
        <p className="text-[13px] mt-2 px-1"><span className="font-bold">Mariana</span> Parabéns! Que festa incrível! 🎉</p>
      </div>

      {/* Feed Item 2 */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#1C1410] text-white flex items-center justify-center text-xs font-bold">L</div>
          <div>
            <p className="text-sm font-bold">Lucas</p>
            <p className="text-[10px] text-[#8B6B47]">Há 5 min</p>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80" className="w-full aspect-[4/5] object-cover rounded-2xl mb-3" alt="" />
        <div className="flex gap-4 px-1">
          <Heart size={22} className="text-[#C4956A] fill-[#C4956A]" />
          <Download size={22} className="text-[#1C1410]" />
        </div>
      </div>
    </div>
  </div>
);


export function MockScreens({ perspective, step }: MockScreensProps) {
  const isHost = perspective === "anfitriao";

  const renderScreen = () => {
    if (isHost) {
      switch (step) {
        case 0: return <HostScreen0 />;
        case 1: return <HostScreen1 />;
        case 2: return <HostScreen2 />;
        case 3: return <HostScreen3 />;
        case 4: return <HostScreen4 />;
        default: return <HostScreen0 />;
      }
    } else {
      switch (step) {
        case 0: return <GuestScreen0 />;
        case 1: return <GuestScreen1 />;
        case 2: return <GuestScreen2 />;
        case 3: return <GuestScreen3 />;
        case 4: return <GuestScreen4 />;
        default: return <GuestScreen0 />;
      }
    }
  };

  return <ScreenWrapper>{renderScreen()}</ScreenWrapper>;
}
