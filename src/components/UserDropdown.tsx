'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Settings, FolderHeart, Globe, Moon, HelpCircle, Power, ChevronDown, Plus } from 'lucide-react'

import { useTranslation } from '@/contexts/I18nContext'
import { useTheme } from 'next-themes'

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

  // Use global context for i18n and themes
  const { t, locale, setLocale } = useTranslation()
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch on themes/locales by ensuring client-side only render for selects
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

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
    <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group">
      <div className={`flex items-center gap-3 transition-colors ${danger ? 'text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-ink transition-colors'}`}>
        {icon}
        <span className={`text-[14px] font-medium transition-colors ${danger ? 'text-red-600 dark:text-red-500' : 'text-slate dark:text-gray-300 group-hover:text-ink'}`}>{label}</span>
      </div>
      {badge && (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ink/5 dark:bg-white/10 text-ink border border-ink/10 dark:border-white/20 shadow-sm">
          {badge}
        </span>
      )}
    </button>
  )

  const MenuSelect = ({ icon, label, value, options, onChange }: { icon: React.ReactNode, label: string, value: string, options: { value: string, label: string }[], onChange: (val: string) => void }) => (
    <div className="w-full flex items-center justify-between px-5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 group-hover:text-ink transition-colors">
        {icon}
        <span className="text-[14px] text-slate dark:text-gray-300 group-hover:text-ink font-medium transition-colors">{label}</span>
      </div>
      <div className="relative">
        {mounted ? (
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none bg-canvas border border-hairline dark:border-white/20 text-ink text-[13px] font-semibold rounded-md pl-3 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink hover:border-hairline-soft cursor-pointer transition-colors shadow-sm"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-canvas text-ink py-1">{opt.label}</option>
            ))}
          </select>
        ) : (
          <div className="w-[100px] h-[28px] bg-canvas/50 animate-pulse rounded-md" />
        )}
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-canvas to-canvas-warm border border-ink/10 shadow-sm flex items-center justify-center text-ink font-bold hover:ring-2 hover:ring-ink/5 transition-all"
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
            className="absolute right-0 mt-3 w-[320px] bg-canvas/90 backdrop-blur-xl border border-ink/10 dark:border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden origin-top-right font-sans"
          >
            {/* Header info */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-canvas to-canvas-warm border border-ink/10 shadow-inner flex items-center justify-center text-ink font-bold text-xl flex-shrink-0">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-[16px] font-bold text-ink truncate leading-tight">{name || t('userMenu.defaultUser')}</p>
                <p className="text-[13px] text-slate truncate mt-0.5">{email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex flex-col gap-2.5">
              <button 
                onClick={() => navigateTo('/pricing')} 
                className="w-full py-2.5 bg-ink hover:opacity-85 text-canvas text-[14px] font-bold rounded-xl transition-all active:scale-95 shadow-md flex justify-center items-center"
              >
                {t('userMenu.getPlan')}
              </button>
              <button 
                onClick={() => navigateTo('/dashboard/events/new')} 
                className="w-full py-2.5 bg-canvas border border-hairline hover:bg-canvas-warm text-ink text-[14px] font-bold rounded-xl transition-all active:scale-95 shadow-sm flex justify-center items-center gap-2"
              >
                <Plus size={16} /> {t('userMenu.createEvent')}
              </button>
            </div>

            <div className="h-px w-full bg-ink/5 dark:bg-white/10" />

            {/* Links */}
            <div className="py-2 flex flex-col">
              <MenuItem 
                icon={<CreditCard size={18} strokeWidth={2} />} 
                label={t('userMenu.billing')} 
                badge={plan} 
                onClick={() => navigateTo('/dashboard/billing')} 
              />
              <MenuItem 
                icon={<Settings size={18} strokeWidth={2} />} 
                label={t('userMenu.settings')} 
                onClick={() => navigateTo('/dashboard/settings')} 
              />
              <MenuItem 
                icon={<FolderHeart size={18} strokeWidth={2} />} 
                label={t('userMenu.folders')} 
                onClick={() => navigateTo('/dashboard/folders')} 
              />
              
              {/* Select items */}
              <MenuSelect 
                icon={<Globe size={18} strokeWidth={2} />} 
                label={t('userMenu.language')} 
                value={locale} 
                options={[
                  { value: 'pt', label: t('languages.pt') },
                  { value: 'en', label: t('languages.en') },
                  { value: 'es', label: t('languages.es') }
                ]} 
                onChange={(val: string) => setLocale(val as any)}
              />
              <MenuSelect 
                icon={<Moon size={18} strokeWidth={2} />} 
                label={t('userMenu.theme')} 
                value={theme || 'system'} 
                options={[
                  { value: 'system', label: t('themes.system') },
                  { value: 'light', label: t('themes.light') },
                  { value: 'dark', label: t('themes.dark') }
                ]} 
                onChange={setTheme}
              />
              
              <MenuItem 
                icon={<HelpCircle size={18} strokeWidth={2} />} 
                label={t('userMenu.help')} 
                onClick={() => navigateTo('/help')} 
              />
            </div>

            <div className="h-px w-full bg-ink/5 dark:bg-white/10" />

            <div className="py-2">
              <MenuItem 
                danger
                icon={<Power size={18} strokeWidth={2} />} 
                label={t('userMenu.logout')} 
                onClick={handleSignOut} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
