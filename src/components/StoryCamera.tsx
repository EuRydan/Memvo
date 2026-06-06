'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface StoryCameraProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function StoryCamera({ onCapture, onClose }: StoryCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isRecording, setIsRecording] = useState(false)
  const [isReady, setIsReady] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  
  // To handle tap vs long press
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const startTimeRef = useRef<number>(0)

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true, // We want audio for videos
      })
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
      setIsReady(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Não foi possível acessar a câmera. Verifique as permissões.')
      onClose()
    }
  }, [facingMode, onClose, stream])

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  // --- Photo Logic ---
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // If it's the front camera, we might want to flip the image horizontally
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(file)
      onClose()
    }, 'image/jpeg', 0.95)
  }

  // --- Video Logic ---
  const startRecording = () => {
    if (!stream) return
    recordedChunksRef.current = []
    
    try {
      // Use mp4 if supported, else webm
      const mimeType = MediaRecorder.isTypeSupported('video/mp4') 
        ? 'video/mp4' 
        : 'video/webm;codecs=vp8,opus'
        
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType })
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([blob], `video_${Date.now()}.${ext}`, { type: mimeType })
        onCapture(file)
        onClose()
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error('MediaRecorder error:', e)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // --- Button Handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    if (!isReady) return
    
    isLongPressRef.current = false
    startTimeRef.current = Date.now()
    
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      startRecording()
    }, 500) // Hold for 500ms to start video
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault()
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
    }
    
    if (isLongPressRef.current) {
      stopRecording()
    } else {
      // It was a quick tap -> photo
      takePhoto()
    }
  }

  const handlePointerLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
    }
    if (isLongPressRef.current) {
      stopRecording()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />
      
      {/* Hidden Canvas for taking photos */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white active:scale-90 transition-transform">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Toggle Camera Button */}
        <button onClick={toggleCamera} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white active:scale-90 transition-transform">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full pb-12 pt-20 flex flex-col items-center bg-gradient-to-t from-black/60 to-transparent">
        
        {/* Helper Text */}
        <p className={`text-white/80 text-xs font-medium mb-6 tracking-wide transition-opacity duration-300 ${isRecording ? 'opacity-0' : 'opacity-100'}`}>
          Toque para foto • Segure para vídeo
        </p>

        {/* Capture Button */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Recording Progress Ring Animation */}
          {isRecording && (
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="290" strokeDashoffset="0" />
            </svg>
          )}
          
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            className={`w-20 h-20 rounded-full border-[5px] flex items-center justify-center transition-all duration-300 touch-none ${
              isRecording ? 'border-red-500 scale-110' : 'border-white bg-white/20'
            }`}
          >
            <div className={`w-16 h-16 rounded-full transition-all duration-300 ${
              isRecording ? 'bg-red-500 scale-50 rounded-md' : 'bg-white'
            }`} />
          </button>
        </div>
      </div>
    </div>
  )
}
