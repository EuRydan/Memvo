'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ 
  slug, 
  eventName,
  eventDate,
  size = 72, 
  variant = 'default' 
}: { 
  slug: string; 
  eventName?: string;
  eventDate?: string | Date;
  size?: number; 
  variant?: 'default' | 'cover' 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/e/${slug}` : ''

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1 })
    }
  }, [url, size])

  const downloadQR = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set dimensions for high-quality print/story (1080x1920)
    canvas.width = 1080
    canvas.height = 1920
    
    // Draw background
    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw a gradient or some shapes for decoration
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, 'rgba(244, 197, 168, 0.25)') // #f4c5a8 with opacity
    gradient.addColorStop(1, 'rgba(212, 189, 232, 0.25)') // #d4bde8 with opacity
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw card background
    ctx.shadowColor = 'rgba(0,0,0,0.06)'
    ctx.shadowBlur = 60
    ctx.shadowOffsetY = 30
    ctx.fillStyle = '#FFFFFF'
    const cardMargin = 80
    
    // Fallback for roundRect
    if (ctx.roundRect) {
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardMargin, canvas.width - cardMargin * 2, canvas.height - cardMargin * 2, 60)
      ctx.fill()
    } else {
      ctx.fillRect(cardMargin, cardMargin, canvas.width - cardMargin * 2, canvas.height - cardMargin * 2)
    }
    
    ctx.shadowColor = 'transparent' // reset

    // Draw text: Event Name
    ctx.fillStyle = '#0a0a0a'
    ctx.font = 'bold 76px "Helvetica Neue", Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    const nameStr = eventName || "Compartilhe Memórias"
    // Handle long text
    if (nameStr.length > 20) {
      ctx.font = 'bold 64px "Helvetica Neue", Helvetica, Arial, sans-serif'
    }
    ctx.fillText(nameStr, canvas.width / 2, 320)

    // Draw Date
    if (eventDate) {
      ctx.fillStyle = '#666666'
      ctx.font = '500 40px "Helvetica Neue", Helvetica, Arial, sans-serif'
      const dateObj = new Date(eventDate)
      // Ajuste de fuso horário fixo pra evitar um dia a menos, caso seja necessário, ou usar UTC
      const dateStr = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })
      ctx.fillText(dateStr, canvas.width / 2, 400)
    }

    // Load logo
    const logoImg = new Image()
    logoImg.crossOrigin = "anonymous"
    logoImg.src = '/logo-preto.svg'
    
    // Draw QR code function
    const drawQRAndFinish = () => {
      const qrCanvas = document.createElement('canvas')
      QRCode.toCanvas(qrCanvas, url, { width: 660, margin: 1, color: { dark: '#000000', light: '#ffffff' } }, () => {
        // Draw QR code onto main canvas
        ctx.drawImage(qrCanvas, canvas.width / 2 - 330, 560, 660, 660)
        
        // Draw CTA text under QR
        ctx.fillStyle = '#0a0a0a'
        ctx.font = 'bold 52px "Helvetica Neue", Helvetica, Arial, sans-serif'
        ctx.fillText("Escaneie para acessar o álbum", canvas.width / 2, 1340)
        
        ctx.fillStyle = '#666666'
        ctx.font = 'normal 36px "Helvetica Neue", Helvetica, Arial, sans-serif'
        
        const shortUrl = window.location.host + '/e/' + slug
        ctx.fillText(`Ou acesse: ${shortUrl}`, canvas.width / 2, 1420)

        // Download
        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `Cartao-QR-${slug}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }

    logoImg.onload = () => {
      // Draw logo at bottom
      const logoWidth = 140
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth || 77
      ctx.drawImage(logoImg, canvas.width / 2 - logoWidth / 2, 1640, logoWidth, logoHeight)
      drawQRAndFinish()
    }
    
    // Fallback if logo fails to load (dev environment issues sometimes)
    logoImg.onerror = () => {
      drawQRAndFinish()
    }
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
