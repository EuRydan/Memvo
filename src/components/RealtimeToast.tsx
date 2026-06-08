'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'

interface Toast {
  id: string
  guestName: string
  eventName: string
}

export function RealtimeToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obter os eventos do usuário logado
      const { data: events } = await supabase
        .from('events')
        .select('id, name')
        .eq('owner_id', user.id)

      if (!events || events.length === 0) return

      const eventIds = events.map(e => e.id)
      const eventMap = Object.fromEntries(events.map(e => [e.id, e.name]))

      channel = supabase.channel('dashboard-global-notifications')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'media', 
            filter: `event_id=in.(${eventIds.join(',')})` 
          }, 
          (payload) => {
            const media = payload.new
            const eventName = eventMap[media.event_id] || 'seu evento'
            const guestName = media.uploader_name || 'Alguém'
            
            const newToast: Toast = {
              id: media.id || Date.now().toString(),
              guestName,
              eventName
            }
            
            setToasts(prev => [...prev, newToast])
            
            // Auto remover depois de 5 segundos
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== newToast.id))
            }, 5000)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 w-80 flex items-start gap-4 overflow-hidden relative"
          >
            {/* Glimmer effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f4c5a8] via-[#c8b8e0] to-[#b8d4f0]" />
            
            <div className="w-10 h-10 rounded-full bg-[#fafafa] border border-gray-100 flex items-center justify-center flex-shrink-0 text-ink shadow-sm">
              <Camera size={18} />
            </div>
            
            <div className="flex flex-col pt-0.5">
              <p className="text-sm text-ink leading-snug pr-4">
                <span className="font-bold">{toast.guestName}</span> enviou uma nova foto para <span className="font-semibold">{toast.eventName}</span>!
              </p>
            </div>
            
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
