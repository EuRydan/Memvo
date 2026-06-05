"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function WordmarkFooter() {
  return (
    <footer className="relative bg-[#0a0a0a] pt-20 pb-10 overflow-hidden text-[#fafafa] flex flex-col items-center">
      {/* Background Orbs to match identity, but darker */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #f4c5a8 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #c8b8e0 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />

      <div className="w-full max-w-7xl px-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
        
        {/* Left Side: Links */}
        <div className="flex flex-col gap-6">
          <p className="text-sm text-white/50 font-semibold tracking-widest uppercase">Navegação</p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="text-xl font-medium hover:text-[#f4c5a8] transition-colors">Início</Link>
            <Link href="/pricing" className="text-xl font-medium hover:text-[#f4c5a8] transition-colors">Planos e Preços</Link>
            <Link href="/login" className="text-xl font-medium hover:text-[#f4c5a8] transition-colors">Entrar na Conta</Link>
          </div>
        </div>

        {/* Right Side: Contact / Socials */}
        <div className="flex flex-col gap-6 md:text-right">
          <p className="text-sm text-white/50 font-semibold tracking-widest uppercase">Contato</p>
          <div className="flex flex-col gap-3">
            <a href="mailto:contato@memvo.com" className="text-xl font-medium hover:text-[#c8b8e0] transition-colors">contato@memvo.com</a>
            <div className="flex items-center md:justify-end gap-6 mt-2">
              <a href="#" className="text-white/70 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </div>

      {/* Huge Wordmark */}
      <div className="w-full px-4 relative z-10 flex justify-center overflow-hidden">
        <motion.h2 
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[20vw] font-bold leading-[0.75] tracking-[-0.04em] select-none text-transparent"
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            WebkitTextStroke: '2px rgba(255,255,255,0.1)',
            backgroundImage: 'linear-gradient(135deg, #f4c5a8 0%, #c8b8e0 50%, #b8d4f0 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Memvo
        </motion.h2>
      </div>

      {/* Bottom Bar */}
      <div className="w-full max-w-7xl px-6 mt-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-medium">
        <p>© {new Date().getFullYear()} Memvo. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
          <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
        </div>
      </div>
    </footer>
  );
}
