'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, QrCode, Users, ImageIcon } from 'lucide-react'

interface EventShareCardProps {
  eventName: string
  eventDate: string
  inviteLink: string
  guestCount: number
  photoCount: number
  slug: string
  coverUrl?: string
}

export function EventShareCard({
  eventName,
  eventDate,
  inviteLink,
  guestCount,
  photoCount,
  slug,
  coverUrl,
}: EventShareCardProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    })
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full"
    >
      <div
        className="rounded-[20px] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        {/* Gradient accent band */}
        <div
          className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, #fdceb0 0%, #d0c0e8 60%, #b8d0f0 100%)' }}
        />

        <div className="p-6 flex flex-col gap-5">

          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#939393] uppercase">
              Compartilhe o álbum
            </p>
            <h2
              className="text-[1.3rem] font-bold tracking-[-0.02em] text-[#030303] leading-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {eventName}
            </h2>
            <p className="text-xs text-[#676f7b]">{eventDate}</p>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium text-[#030303]"
              style={{ background: '#f4f4f4' }}
            >
              <Users size={13} className="text-[#939393]" />
              <span><strong>{guestCount}</strong> envio{guestCount !== 1 ? 's' : ''}</span>
            </div>
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium text-[#030303]"
              style={{ background: '#f4f4f4' }}
            >
              <ImageIcon size={13} className="text-[#939393]" />
              <span><strong>{photoCount}</strong> foto{photoCount !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-[#e7eaf0]" />

          {/* Invite section */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-semibold text-[#030303] mb-0.5">Link de convite</p>
              <p className="text-xs text-[#939393]">
                Envie para os convidados. Eles não precisam criar conta.
              </p>
            </div>

            {/* URL + copy row */}
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center px-4 h-11 rounded-full text-xs font-mono text-[#676f7b] overflow-hidden"
                style={{
                  background: '#f4f4f4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span className="truncate">{inviteLink}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-5 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200"
                style={{
                  background: hasCopied ? '#f0fdf4' : '#030303',
                  color: hasCopied ? '#16a34a' : '#ffffff',
                  border: hasCopied ? '1px solid #bbf7d0' : '1px solid transparent',
                }}
              >
                {hasCopied
                  ? <><Check size={13} /> Copiado!</>
                  : <><Copy size={13} /> Copiar link</>
                }
              </motion.button>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-[#e7eaf0]" />

          {/* Cover Image or QR Code hint */}
          <motion.div variants={itemVariants} className="w-full">
            {coverUrl ? (
              <div 
                className="w-full h-32 rounded-xl overflow-hidden relative"
                style={{
                  background: '#f4f4f4'
                }}
              >
                <img src={coverUrl} alt="Capa do Evento" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#f4f4f4' }}
                  >
                    <QrCode size={17} className="text-[#676f7b]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#030303]">QR Code do evento</p>
                    <p className="text-[11px] text-[#939393]">Ideal para imprimir e colocar na mesa</p>
                  </div>
                </div>
                <a
                  href={`/e/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#030303] underline underline-offset-2 hover:opacity-60 transition-opacity"
                >
                  Ver página
                </a>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}
