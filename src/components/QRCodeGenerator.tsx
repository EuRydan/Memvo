'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/e/${slug}` : ''

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 })
    }
  }, [url])

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `qrcode-${slug}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} />
      <button 
        onClick={downloadQR}
        className="text-xs text-slate hover:text-ink underline transition cursor-pointer"
      >
        Baixar QR Code
      </button>
    </div>
  )
}
