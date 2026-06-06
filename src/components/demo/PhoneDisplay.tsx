"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "./DemoSection";
import { Iphone } from "@/components/ui/iphone";
import { MockScreens } from "./MockScreens";

export function PhoneDisplay() {
  const { state } = useDemo();

  return (
    <div className="w-[240px] md:w-[260px] lg:w-[300px] flex-shrink-0 relative">
      <Iphone className="drop-shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.perspective}-${state.currentStep}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full overflow-hidden rounded-[2.8rem]"
          >
            <MockScreens perspective={state.perspective} step={state.currentStep} />
          </motion.div>
        </AnimatePresence>
      </Iphone>
      
      {/* Decorative blurry glow behind the phone */}
      <div 
        className="absolute inset-0 -z-10 bg-[#C4956A]/20 blur-[80px] rounded-full"
        style={{ transform: 'scale(0.8)' }}
      />
    </div>
  );
}
