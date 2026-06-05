"use client";
import { motion } from "framer-motion";
import { CalendarRange, Plus, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TiltedDock() {
  const router = useRouter();
  const supabase = createClient();
  const [hovered, setHovered] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const icons = [
    { id: 1, icon: <CalendarRange size={26} strokeWidth={2} />, label: "Eventos", action: () => router.push('/dashboard') },
    { id: 2, icon: <Plus size={28} strokeWidth={2.5} />, label: "Novo Evento", action: () => router.push('/dashboard/new') },
    { id: 3, icon: <LogOut size={26} strokeWidth={2} />, label: "Sair", action: async () => { await supabase.auth.signOut(); router.push('/login') } },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        className="flex gap-12 px-12 py-5 rounded-full pointer-events-auto"
        style={{
          transformStyle: "preserve-3d",
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}
        animate={{
          rotateX: 18,
          rotateY: mouse.x * 10,
        }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        {icons.map((item) => (
          <motion.div
            key={item.id}
            className="relative flex flex-col items-center justify-center cursor-pointer"
            onHoverStart={() => setHovered(item.id)}
            onHoverEnd={() => setHovered(null)}
            onClick={item.action}
            animate={{
              scale: hovered === item.id ? 1.4 : 1,
              z: hovered === item.id ? 80 : hovered ? -10 : 0,
              opacity: hovered && hovered !== item.id ? 0.6 : 1,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Icon Background Bubble for Hover */}
            <motion.div
              className="absolute inset-0 bg-[#f0f0f0] rounded-full -z-10"
              animate={{
                scale: hovered === item.id ? 1.4 : 0,
                opacity: hovered === item.id ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
            
            {/* Icon */}
            <motion.div
              animate={{
                rotateX: hovered === item.id ? -10 : 0,
                rotateY: hovered === item.id ? 10 : 0,
                color: hovered === item.id ? "#0a0a0a" : "#676f7b"
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="text-[#676f7b]"
            >
              {item.icon}
            </motion.div>

            {/* Label */}
            <motion.span
              className="absolute -bottom-8 text-[11px] font-bold text-[#0a0a0a] whitespace-nowrap"
              animate={{ opacity: hovered === item.id ? 1 : 0, y: hovered === item.id ? 0 : 5 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
