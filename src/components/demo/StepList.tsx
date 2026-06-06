"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "./DemoSection";
import { Check } from "lucide-react";

const HOST_STEPS = [
  {
    title: "Crie seu evento em segundos",
    description: "Dê um nome, escolha a data e personalize o álbum. Pronto em menos de 2 minutos.",
  },
  {
    title: "Compartilhe com um QR Code",
    description: "Um código único é gerado para o seu evento. Imprima, projete ou envie — seus convidados acessam instantaneamente.",
  },
  {
    title: "Seus convidados enviam em tempo real",
    description: "Sem app, sem cadastro. Eles escaneiam, tiram a foto ou escolhem da galeria, e aparece no seu álbum na hora.",
  },
  {
    title: "Todas as memórias em um só lugar",
    description: "Veja o álbum completo do seu evento, organizado automaticamente. Curta, salve e reviva cada momento.",
  },
  {
    title: "Baixe tudo com um clique",
    description: "Faça o download do álbum completo em alta resolução. Suas memórias, para sempre.",
  },
];

const GUEST_STEPS = [
  {
    title: "Escaneie o QR Code",
    description: "Sem app para baixar. Aponte a câmera para o código e você já está dentro.",
  },
  {
    title: "Acesso instantâneo, sem cadastro",
    description: "Em um toque, você já está no álbum do evento. Só precisa do seu nome.",
  },
  {
    title: "Envie sua foto do jeito que quiser",
    description: "Tire uma foto agora ou escolha uma da galeria. Vai direto para o álbum do evento.",
  },
  {
    title: "Sua memória está no álbum!",
    description: "Pronto. Sua foto aparece em tempo real para o anfitrião e todos os convidados.",
  },
  {
    title: "Veja o que todo mundo capturou",
    description: "Curta as fotos dos outros convidados e reviva o evento pelo olhar de cada um.",
  },
];

export function StepList() {
  const { state, dispatch } = useDemo();
  const steps = state.perspective === "anfitriao" ? HOST_STEPS : GUEST_STEPS;

  return (
    <div className="relative flex flex-col gap-6 pl-4 md:pl-0">
      {/* Vertical line connecting steps */}
      <div className="absolute left-[23px] top-4 bottom-8 w-[2px] bg-[#E8DDD0] hidden md:block" />
      <div 
        className="absolute left-[23px] top-4 w-[2px] bg-[#C4956A] hidden md:block transition-all duration-700 ease-in-out"
        style={{ height: `calc(${state.currentStep * 25}% + ${state.currentStep === 4 ? '1rem' : '0px'})` }}
      />

      {steps.map((step, index) => {
        const isActive = index === state.currentStep;
        const isCompleted = index < state.currentStep;

        return (
          <button
            key={`${state.perspective}-${index}`}
            onClick={() => dispatch({ type: "SET_STEP", payload: index })}
            className={`relative flex items-start gap-5 text-left w-full group transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-50 hover:opacity-80"
            }`}
            aria-current={isActive ? "step" : undefined}
          >
            {/* Step Number / Icon */}
            <div 
              className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 bg-[#FAF7F2] ${
                isActive 
                  ? "border-[#C4956A] text-[#C4956A]" 
                  : isCompleted 
                    ? "border-[#C4956A] bg-[#C4956A] text-white" 
                    : "border-[#E8DDD0] text-[#8B6B47]"
              }`}
            >
              {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
              
              {/* Progress Ring for Active Step */}
              {isActive && !state.isPaused && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#C4956A"
                    strokeWidth="2"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                </svg>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-1">
              <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                isActive ? "text-[#1C1410]" : "text-[#8B6B47]"
              }`}>
                {step.title}
              </h3>
              
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-[#8B6B47] text-base mt-2 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="mt-4 flex items-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "NEXT_STEP" });
                        }}
                        className="text-[#C4956A] text-sm font-bold flex items-center gap-1 hover:underline"
                      >
                        {index === 4 ? "Recomeçar ↺" : "Próximo →"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        );
      })}
    </div>
  );
}
