'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ slug, size = 72 }: { slug: string; size?: number }) {
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
    <div className="flex flex-col items-center gap-1.5">
      <canvas ref={canvasRef} className="rounded-md" />
      <button
        onClick={downloadQR}
        className="text-[10px] text-slate hover:text-ink underline transition cursor-pointer leading-none"
      >
        Baixar
      </button>
    </div>
  )
}
