'use client'

import React, { useState } from 'react'
import { Media } from '@/types'
import { Share, Loader2 } from 'lucide-react'

// Helper to get public URL
const getPublicUrl = (path: string) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

export function StoryGenerator({ event, medias }: { event: { name: string, date: string, id: string }, medias: Media[] }) {
  const [generating, setGenerating] = useState(false)

  const handleShare = async () => {
    setGenerating(true)
    try {
      // 1. Pick up to 4 distinct photos
      const challengePhotos = new Map<string, Media>()
      for (const m of medias) {
        if (m.type === 'photo' && m.challenge_id) {
          if (!challengePhotos.has(m.challenge_id)) {
            challengePhotos.set(m.challenge_id, m)
          }
        }
      }
      const selected = Array.from(challengePhotos.values()).slice(0, 4)
      
      // If we don't have enough from distinct challenges, fill with free photos or any other photo
      if (selected.length < 4) {
        const remainingPhotos = medias.filter(m => m.type === 'photo' && !selected.find(s => s.id === m.id))
        for (const m of remainingPhotos) {
          if (selected.length < 4) {
            selected.push(m)
          }
        }
      }

      if (selected.length === 0) {
        alert("Não há fotos suficientes para gerar o Story.")
        setGenerating(false)
        return
      }

      // 2. Load images into HTML Image elements
      const loadedImages = await Promise.all(selected.map(m => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error('Falha ao carregar imagem'))
          img.src = getPublicUrl(m.storage_path)
        })
      }))

      // 3. Create Canvas 1080x1920
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error("Canvas context error")

      // Background
      ctx.fillStyle = '#FAFAFA'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, 'rgba(244, 197, 168, 0.4)')
      gradient.addColorStop(1, 'rgba(212, 189, 232, 0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add "Memórias de" + Event Name at top
      ctx.fillStyle = '#0a0a0a'
      ctx.textAlign = 'center'
      ctx.font = 'bold 80px "Helvetica Neue", Helvetica, Arial, sans-serif'
      // handle very long names
      let nameStr = event.name
      if (nameStr.length > 20) {
        ctx.font = 'bold 60px "Helvetica Neue", Helvetica, Arial, sans-serif'
        if (nameStr.length > 30) nameStr = nameStr.substring(0, 27) + "..."
      }
      ctx.fillText(nameStr, canvas.width / 2, 220)

      ctx.fillStyle = '#666666'
      ctx.font = 'normal 45px "Helvetica Neue", Helvetica, Arial, sans-serif'
      ctx.fillText("Melhores momentos", canvas.width / 2, 290)

      // Draw polaroids. Pos coordinates optimized for 1-4 images
      const basePositions = [
        { x: 340, y: 650, r: -6 },
        { x: 740, y: 800, r: 8 },
        { x: 380, y: 1200, r: 5 },
        { x: 700, y: 1400, r: -7 }
      ]
      
      // Adjust if fewer than 4 images
      const positions = loadedImages.length === 1 ? [{ x: 540, y: 960, r: 2 }] : 
                        loadedImages.length === 2 ? [{ x: 540, y: 650, r: -4 }, { x: 540, y: 1250, r: 4 }] : 
                        basePositions

      loadedImages.forEach((img, i) => {
        const pos = positions[i] || positions[0]
        ctx.save()
        ctx.translate(pos.x, pos.y)
        ctx.rotate((pos.r * Math.PI) / 180)
        
        // Polaroid size
        const pWidth = 550
        const pHeight = 650
        
        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.15)'
        ctx.shadowBlur = 40
        ctx.shadowOffsetY = 20
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(-pWidth/2, -pHeight/2, pWidth, pHeight)
        
        // Reset shadow for image
        ctx.shadowColor = 'transparent'
        
        // Image padding inside polaroid
        const pad = 24
        const imgW = pWidth - pad * 2
        const imgH = pHeight - pad * 3 - 60 // bottom padding for polaroid look
        
        // Crop and draw image (cover)
        const scale = Math.max(imgW / img.width, imgH / img.height)
        const sx = (img.width - imgW / scale) / 2
        const sy = (img.height - imgH / scale) / 2
        
        ctx.drawImage(img, sx, sy, imgW / scale, imgH / scale, -imgW/2, -pHeight/2 + pad, imgW, imgH)
        
        ctx.restore()
      })

      // Footer
      ctx.fillStyle = '#0a0a0a'
      ctx.textAlign = 'center'
      ctx.font = 'bold 44px "Helvetica Neue", Helvetica, Arial, sans-serif'
      ctx.fillText("Missões concluídas no Memvo", canvas.width / 2, 1800)

      // 4. Generate Blob and Share
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setGenerating(false)
          return
        }
        const file = new File([blob], `Memvo-${event.name.replace(/\s+/g, '-')}-Story.png`, { type: 'image/png' })
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${event.name} - Memvo`,
              text: 'Nossos melhores momentos!'
            })
          } catch (err) {
            console.error('Share failed', err)
            // Fallback download
            downloadFile(file)
          }
        } else {
          // Fallback download
          downloadFile(file)
        }
        setGenerating(false)
      }, 'image/png', 0.9)
      
    } catch (error) {
      console.error(error)
      alert("Erro ao gerar o Story. Verifique a conexão.")
      setGenerating(false)
    }
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full flex justify-center mt-6 mb-8 px-4">
      <button
        onClick={handleShare}
        disabled={generating || medias.filter(m => m.type === 'photo').length === 0}
        className="flex items-center justify-center gap-2 w-full max-w-sm bg-[#0a0a0a] text-white font-bold py-3.5 px-6 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
      >
        {generating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Gerando Mágica...
          </>
        ) : (
          <>
            <Share size={20} />
            Compartilhar Melhores Momentos
          </>
        )}
      </button>
    </div>
  )
}
