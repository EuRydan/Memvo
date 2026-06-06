"use client";

import React from "react";
import { motion } from "framer-motion";
import { useDemo } from "./DemoSection";
import { Crown, Camera } from "lucide-react";

export function PerspectiveTabs() {
  const { state, dispatch } = useDemo();

  return (
    <div className="flex bg-[#E8DDD0]/40 p-1.5 rounded-full w-fit relative" role="tablist">
      <button
        role="tab"
        aria-selected={state.perspective === "anfitriao"}
        onClick={() => dispatch({ type: "SET_PERSPECTIVE", payload: "anfitriao" })}
        className={`relative z-10 flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-300 ${
          state.perspective === "anfitriao" ? "text-white" : "text-[#8B6B47] hover:text-[#1C1410]"
        }`}
      >
        <Crown size={18} className={state.perspective === "anfitriao" ? "text-white" : "text-[#C4956A]"} />
        Visão do Anfitrião
        {state.perspective === "anfitriao" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#C4956A] rounded-full -z-10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>

      <button
        role="tab"
        aria-selected={state.perspective === "convidado"}
        onClick={() => dispatch({ type: "SET_PERSPECTIVE", payload: "convidado" })}
        className={`relative z-10 flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-300 ${
          state.perspective === "convidado" ? "text-white" : "text-[#8B6B47] hover:text-[#1C1410]"
        }`}
      >
        <Camera size={18} className={state.perspective === "convidado" ? "text-white" : "text-[#C4956A]"} />
        Visão do Convidado
        {state.perspective === "convidado" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#C4956A] rounded-full -z-10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
}
