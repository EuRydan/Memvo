'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Settings, FolderHeart, Globe, Moon, HelpCircle, Power, ChevronDown, LayoutDashboard } from 'lucide-react'

interface UserDropdownProps {
  email: string
  name: string
  plan?: string
}

export function UserDropdown({ email, name, plan = 'Free' }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigateTo = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  // Generate initial
  const initial = name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?')

  const MenuItem = ({ icon, label, badge, onClick }: { icon: React.ReactNode, label: string, badge?: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-[#222] transition-colors group">
      <div className="flex items-center gap-3 text-[#8a8a93] group-hover:text-white transition-colors">
        {icon}
        <span className="text-[14px] text-gray-200 font-medium">{label}</span>
      </div>
      {badge && (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#2a2a35] text-indigo-300 border border-[#3f3f5a]">
          {badge}
        </span>
      )}
    </button>
  )

  const MenuSelect = ({ icon, label, value, options }: { icon: React.ReactNode, label: string, value: string, options: string[] }) => (
    <div className="w-full flex items-center justify-between px-5 py-2 hover:bg-[#222] transition-colors group">
      <div className="flex items-center gap-3 text-[#8a8a93] group-hover:text-white transition-colors">
        {icon}
        <span className="text-[14px] text-gray-200 font-medium">{label}</span>
      </div>
      <div className="relative">
        <select 
          defaultValue={value}
          className="appearance-none bg-transparent border border-[#333] text-gray-200 text-[13px] font-medium rounded-md pl-3 pr-8 py-1 focus:outline-none focus:border-[#5264F9] hover:border-[#555] cursor-pointer transition-colors"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#161616] text-white py-1">{opt}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#0ea5e9] border border-[#0ea5e9]/20 shadow-sm flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity"
      >
        {initial}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[320px] bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right text-gray-200 font-sans"
          >
            {/* Header info */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-[15px] font-bold text-white truncate">{name || 'Usuário'}</p>
                <p className="text-[13px] text-[#8a8a93] truncate mt-0.5">{email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex flex-col gap-2.5">
              <button 
                onClick={() => navigateTo('/pricing')} 
                className="w-full py-2.5 bg-[#5264F9] hover:bg-[#4353d8] text-white text-[14px] font-semibold rounded-lg transition-colors flex justify-center items-center"
              >
                Obter um plano
              </button>
              <button 
                onClick={() => navigateTo('/dashboard/events/new')} 
                className="w-full py-2.5 bg-transparent border border-[#333] hover:bg-[#222] text-white text-[14px] font-semibold rounded-lg transition-colors flex justify-center items-center"
              >
                Criar um evento
              </button>
            </div>

            <div className="h-px w-full bg-[#2a2a2a]" />

            {/* Links */}
            <div className="py-2 flex flex-col">
              <MenuItem 
                icon={<CreditCard size={18} strokeWidth={2} />} 
                label="Plano e faturamento" 
                badge={plan} 
                onClick={() => navigateTo('/dashboard/billing')} 
              />
              <MenuItem 
                icon={<Settings size={18} strokeWidth={2} />} 
                label="Ajustes" 
                onClick={() => navigateTo('/dashboard/settings')} 
              />
              <MenuItem 
                icon={<FolderHeart size={18} strokeWidth={2} />} 
                label="Minhas pastas" 
                onClick={() => navigateTo('/dashboard/folders')} 
              />
              
              {/* Select items */}
              <MenuSelect 
                icon={<Globe size={18} strokeWidth={2} />} 
                label="Idioma" 
                value="Português" 
                options={['Português', 'Inglês', 'Espanhol']} 
              />
              <MenuSelect 
                icon={<Moon size={18} strokeWidth={2} />} 
                label="Tema" 
                value="Sistema" 
                options={['Sistema', 'Claro', 'Escuro']} 
              />
              
              <MenuItem 
                icon={<HelpCircle size={18} strokeWidth={2} />} 
                label="Ajuda" 
                onClick={() => navigateTo('/help')} 
              />
            </div>

            <div className="h-px w-full bg-[#2a2a2a]" />

            <div className="py-2">
              <MenuItem 
                icon={<Power size={18} strokeWidth={2} />} 
                label="Sair" 
                onClick={handleSignOut} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
