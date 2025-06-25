import React from 'react'
import cn from 'classnames'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base = 'rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition'
  const variants: Record<string, string> = {
    primary: 'bg-[#1976d2] text-white hover:bg-[#115293] focus:ring-[#1976d2]',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: 'bg-transparent border border-gray-400 text-gray-800 hover:bg-gray-100 focus:ring-gray-400',
  }
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-md',
    lg: 'px-6 py-3 text-lg',
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
