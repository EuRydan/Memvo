'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ slug, size = 72, variant = 'default' }: { slug: string; size?: number; variant?: 'default' | 'cover' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/e/${slug}` : ''

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1 })
    }
  }, [url, size])

  const downloadQR = () => {
    // Render a higher-res version for download
    const offscreen = document.createElement('canvas')
    QRCode.toCanvas(offscreen, url, { width: 400, margin: 2 }, () => {
      const pngUrl = offscreen.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `qrcode-${slug}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  return (
    <div className={`relative ${variant === 'cover' ? 'w-full h-full flex items-center justify-center bg-white rounded-[18px]' : 'flex flex-col items-center gap-1.5'}`}>
      <canvas ref={canvasRef} className={variant === 'cover' ? 'w-[75%] h-[75%] object-contain' : 'rounded-md'} />
      {variant === 'default' ? (
        <button
          onClick={downloadQR}
          className="text-[10px] text-slate hover:text-ink underline transition cursor-pointer leading-none"
        >
          Baixar
        </button>
      ) : (
        <button
          onClick={downloadQR}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-gray-900 p-2 rounded-full shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer border border-gray-200/50"
          title="Baixar QR Code"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      )}
    </div>
  )
}
