'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: 'bg-green-900/30 border-green-600 text-green-400',
    error: 'bg-red-900/30 border-red-600 text-red-400',
    info: 'bg-blue-900/30 border-blue-600 text-blue-400',
    warning: 'bg-yellow-900/30 border-yellow-600 text-yellow-400',
  }

  const Icon = icons[type]

  return (
    <div
      className={`fixed bottom-4 right-4 glass rounded-lg p-4 border ${colors[type]} flex items-center gap-3 min-w-[300px] max-w-md z-50 animate-slide-up`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

