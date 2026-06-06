import React from 'react'

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img 
      src="/logo.png" 
      alt="Memvor Logo" 
      className={className} 
      style={{ objectFit: 'contain' }}
    />
  )
}
