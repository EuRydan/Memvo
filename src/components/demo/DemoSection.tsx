"use client";

import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { PerspectiveTabs } from "./PerspectiveTabs";
import { StepList } from "./StepList";
import { PhoneDisplay } from "./PhoneDisplay";

export type Perspective = "anfitriao" | "convidado";

export interface DemoState {
  perspective: Perspective;
  currentStep: number;
  isAnimating: boolean;
  isPaused: boolean;
}

type DemoAction =
  | { type: "SET_PERSPECTIVE"; payload: Perspective }
  | { type: "SET_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "SET_ANIMATING"; payload: boolean }
  | { type: "SET_PAUSED"; payload: boolean };

const initialState: DemoState = {
  perspective: "anfitriao",
  currentStep: 0,
  isAnimating: false,
  isPaused: false,
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "SET_PERSPECTIVE":
      if (state.perspective === action.payload) return state;
      return { ...state, perspective: action.payload, currentStep: 0, isPaused: false };
    case "SET_STEP":
      return { ...state, currentStep: action.payload, isPaused: true };
    case "NEXT_STEP":
      if (state.currentStep >= 4) {
        return { ...state, currentStep: 0, isPaused: true }; // Pause at the end until they interact
      }
      return { ...state, currentStep: state.currentStep + 1 };
    case "SET_ANIMATING":
      return { ...state, isAnimating: action.payload };
    case "SET_PAUSED":
      return { ...state, isPaused: action.payload };
    default:
      return state;
  }
}

interface DemoContextProps {
  state: DemoState;
  dispatch: React.Dispatch<DemoAction>;
}

const DemoContext = createContext<DemoContextProps | undefined>(undefined);

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoSection");
  return context;
}

export function DemoSection() {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance logic
  useEffect(() => {
    if (state.isPaused) return;
    
    timerRef.current = setTimeout(() => {
      dispatch({ type: "NEXT_STEP" });
    }, 6000); // 6 seconds per step

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.currentStep, state.perspective, state.isPaused]);

  return (
    <DemoContext.Provider value={{ state, dispatch }}>
      <section className="py-24 bg-[#FAF7F2] font-[family-name:var(--font-dm-sans)] overflow-hidden" id="demo">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <p className="text-[#C4956A] text-sm font-bold tracking-[0.2em] uppercase mb-4">
              Como funciona
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-[56px] text-[#1C1410] mb-6 font-semibold leading-[1.1] tracking-tight">
              Experimente antes de criar<br className="hidden md:block"/> seu evento
            </h2>
            <p className="text-[#8B6B47] text-lg max-w-xl mb-12">
              Veja como é simples para o anfitrião e para os convidados. Sem complicação, só memórias.
            </p>
            
            <PerspectiveTabs />
          </div>

          <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24 items-center lg:items-center mt-8">
            <div className="w-full lg:w-[45%]">
              <StepList />
            </div>
            <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
              <PhoneDisplay />
            </div>
          </div>
        </div>
      </section>
    </DemoContext.Provider>
  );
}
