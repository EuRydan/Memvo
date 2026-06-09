'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LayoutDashboard, LogOut } from 'lucide-react'

interface UserDropdownProps {
  email: string
  name: string
}

export function UserDropdown({ email, name }: UserDropdownProps) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-gray-200 shadow-sm flex items-center justify-center text-ink font-semibold hover:ring-2 hover:ring-gray-200 hover:ring-offset-1 transition-all"
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
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 origin-top-right"
          >
            {/* Header info */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-900 truncate">{name || 'Anfitrião'}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
            </div>

            {/* Links */}
            <div className="p-2 flex flex-col gap-1">
              <button
                onClick={() => navigateTo('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <LayoutDashboard size={16} className="text-gray-400" /> Painel de Eventos
              </button>
              
              <button
                onClick={() => navigateTo('/dashboard/profile')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <User size={16} className="text-gray-400" /> Meu Perfil
              </button>

              <button
                onClick={() => navigateTo('/dashboard/settings')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Settings size={16} className="text-gray-400" /> Configurações e Plano
              </button>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="text-red-400" /> Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
