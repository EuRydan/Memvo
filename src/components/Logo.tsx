import React from 'react'

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 14 120 66" 
      fill="currentColor" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 0 50 
               A 25 25 0 0 1 50 50 
               A 35 35 0 0 1 120 50 
               L 120 80 
               L 0 80 
               Z" />
    </svg>
  )
}
