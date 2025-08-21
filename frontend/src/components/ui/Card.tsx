import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  gradient?: boolean
}

export default function Card({ 
  children, 
  className = '', 
  hoverable = false,
  gradient = false 
}: CardProps) {
  const baseStyles = 'rounded-2xl shadow-lg border border-gray-100 p-6'
  const bgStyles = gradient 
    ? 'bg-gradient-to-br from-white to-gray-50/50' 
    : 'bg-white'
  const hoverStyles = hoverable ? 'card-hover group' : ''
  
  return (
    <div className={`${baseStyles} ${bgStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  )
}