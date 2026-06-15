import React from 'react'

export function Logo({ className = "h-8 w-auto", theme = "auto" }: { className?: string, theme?: 'auto' | 'light' | 'dark' }) {
  if (theme === 'light') {
    return <img src="/logo-preto.svg" alt="Memvor Logo" className={className} style={{ objectFit: 'contain' }} />
  }
  
  if (theme === 'dark') {
    return <img src="/logo-branco.svg" alt="Memvor Logo" className={className} style={{ objectFit: 'contain' }} />
  }

  return (
    <>
      <img 
        src="/logo-preto.svg" 
        alt="Memvor Logo" 
        className={`${className} dark:hidden block`} 
        style={{ objectFit: 'contain' }}
      />
      <img 
        src="/logo-branco.svg" 
        alt="Memvor Logo" 
        className={`${className} hidden dark:block`} 
        style={{ objectFit: 'contain' }}
      />
    </>
  )
}
