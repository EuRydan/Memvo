"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesText } from "./ui/sparkles-text";

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide the loading screen after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fafafa]"
        >
          <SparklesText
            className="text-[4rem] md:text-[6rem]"
            style={{ fontFamily: 'var(--font-raleway), Georgia, serif', fontWeight: 700, letterSpacing: "-0.05em" }}
            colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
          >
            Memvor
          </SparklesText>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
