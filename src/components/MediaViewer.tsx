'use client'

import React, { useState } from 'react'
import { Media } from '@/types'

interface MediaViewerProps {
  media: Media
  publicUrl: string
  onClose: () => void
  onDelete: () => void
  canDelete?: boolean
}

export default function MediaViewer({ media, publicUrl, onClose, onDelete, canDelete = true }: MediaViewerProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(publicUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `memvor_${media.id}.${media.type === 'video' ? 'mp4' : 'jpg'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
    // onClose will be handled by the parent when the media is removed
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col animate-fade-in touch-none">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md active:scale-90 transition"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md active:scale-90 transition disabled:opacity-50"
          >
            {isDownloading ? (
              <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>

          {canDelete && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 backdrop-blur-md active:scale-90 transition disabled:opacity-50"
            >
              {isDeleting ? (
                <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {media.type === 'video' ? (
          <video 
            src={publicUrl} 
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain max-h-[85vh] rounded-lg"
          />
        ) : (
          <img 
            src={publicUrl} 
            alt="Memvor"
            className="w-full h-full object-contain max-h-[85vh] rounded-lg"
          />
        )}
      </div>
      
      {/* Footer Info */}
      {media.uploader_name && (
        <div className="absolute bottom-0 left-0 w-full p-6 text-center bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white/90 text-sm font-medium">
            Enviado por {media.uploader_name}
          </p>
        </div>
      )}
    </div>
  )
}
