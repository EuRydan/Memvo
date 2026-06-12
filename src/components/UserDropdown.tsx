'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Settings, FolderHeart, Globe, Moon, HelpCircle, Power, ChevronDown, Plus } from 'lucide-react'

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

  // States for Language and Theme to make them functionally interactive in the UI
  const [language, setLanguage] = useState('Português')
  const [theme, setTheme] = useState('Sistema')

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

  const MenuItem = ({ icon, label, badge, onClick, danger }: { icon: React.ReactNode, label: string, badge?: string, onClick: () => void, danger?: boolean }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-black/5 transition-colors group">
      <div className={`flex items-center gap-3 transition-colors ${danger ? 'text-red-500 group-hover:text-red-600' : 'text-gray-500 group-hover:text-[#0a0a0a]'}`}>
        {icon}
        <span className={`text-[14px] font-medium transition-colors ${danger ? 'text-red-600' : 'text-[#4a4a4a] group-hover:text-[#0a0a0a]'}`}>{label}</span>
      </div>
      {badge && (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0a0a0a]/5 text-[#0a0a0a] border border-[#0a0a0a]/10 shadow-sm">
          {badge}
        </span>
      )}
    </button>
  )

  const MenuSelect = ({ icon, label, value, options, onChange }: { icon: React.ReactNode, label: string, value: string, options: string[], onChange: (val: string) => void }) => (
    <div className="w-full flex items-center justify-between px-5 py-1.5 hover:bg-black/5 transition-colors group">
      <div className="flex items-center gap-3 text-gray-500 group-hover:text-[#0a0a0a] transition-colors">
        {icon}
        <span className="text-[14px] text-[#4a4a4a] group-hover:text-[#0a0a0a] font-medium transition-colors">{label}</span>
      </div>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-200 text-[#0a0a0a] text-[13px] font-semibold rounded-md pl-3 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-[#0a0a0a] hover:border-gray-300 cursor-pointer transition-colors shadow-sm"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-[#0a0a0a] py-1">{opt}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffffff] to-[#fafafa] border border-black/10 shadow-sm flex items-center justify-center text-[#0a0a0a] font-bold hover:ring-2 hover:ring-black/5 transition-all"
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
            className="absolute right-0 mt-3 w-[320px] bg-white/80 backdrop-blur-xl border border-black/10 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] overflow-hidden origin-top-right font-sans"
          >
            {/* Header info */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffffff] to-[#fafafa] border border-black/10 shadow-inner flex items-center justify-center text-[#0a0a0a] font-bold text-xl flex-shrink-0">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-[16px] font-bold text-[#0a0a0a] truncate leading-tight">{name || 'Usuário'}</p>
                <p className="text-[13px] text-gray-500 truncate mt-0.5">{email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex flex-col gap-2.5">
              <button 
                onClick={() => navigateTo('/pricing')} 
                className="w-full py-2.5 bg-[#0a0a0a] hover:bg-black/80 text-white text-[14px] font-bold rounded-xl transition-all active:scale-95 shadow-md flex justify-center items-center"
              >
                Obter um plano
              </button>
              <button 
                onClick={() => navigateTo('/dashboard/events/new')} 
                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#0a0a0a] text-[14px] font-bold rounded-xl transition-all active:scale-95 shadow-sm flex justify-center items-center gap-2"
              >
                <Plus size={16} /> Criar um evento
              </button>
            </div>

            <div className="h-px w-full bg-black/5" />

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
                value={language} 
                options={['Português', 'Inglês', 'Espanhol']} 
                onChange={setLanguage}
              />
              <MenuSelect 
                icon={<Moon size={18} strokeWidth={2} />} 
                label="Tema" 
                value={theme} 
                options={['Sistema', 'Claro', 'Escuro']} 
                onChange={setTheme}
              />
              
              <MenuItem 
                icon={<HelpCircle size={18} strokeWidth={2} />} 
                label="Ajuda" 
                onClick={() => navigateTo('/help')} 
              />
            </div>

            <div className="h-px w-full bg-black/5" />

            <div className="py-2">
              <MenuItem 
                danger
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
