'use client'

import * as React from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastProps extends Omit<Toast, 'id'> {
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'info',
  onClose
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  React.useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(), 300)
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[type]

  const toastClasses = cn(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-xl border backdrop-blur-sm p-4 pr-6 shadow-xl transition-all duration-300 ease-out transform',
    {
      'border-green-200/50 bg-green-50/90 text-green-900 shadow-green-100': type === 'success',
      'border-red-200/50 bg-red-50/90 text-red-900 shadow-red-100': type === 'error',
      'border-yellow-200/50 bg-yellow-50/90 text-yellow-900 shadow-yellow-100': type === 'warning',
      'border-blue-200/50 bg-blue-50/90 text-blue-900 shadow-blue-100': type === 'info'
    },
    isVisible && !isLeaving
      ? 'translate-x-0 opacity-100 scale-100'
      : 'translate-x-full opacity-0 scale-95',
    isLeaving && '-translate-x-full opacity-0 scale-95'
  )

  const iconClasses = cn('h-5 w-5 shrink-0 drop-shadow-sm', {
    'text-green-600': type === 'success',
    'text-red-600': type === 'error',
    'text-yellow-600': type === 'warning',
    'text-blue-600': type === 'info'
  })

  return (
    <div className={toastClasses}>
      {/* Accent line */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', {
        'bg-gradient-to-b from-green-400 to-green-600': type === 'success',
        'bg-gradient-to-b from-red-400 to-red-600': type === 'error',
        'bg-gradient-to-b from-yellow-400 to-yellow-600': type === 'warning',
        'bg-gradient-to-b from-blue-400 to-blue-600': type === 'info'
      })} />

      <div className="flex items-start space-x-3 pl-1">
        <div className={cn('p-1 rounded-full', {
          'bg-green-100': type === 'success',
          'bg-red-100': type === 'error',
          'bg-yellow-100': type === 'warning',
          'bg-blue-100': type === 'info'
        })}>
          <Icon className={iconClasses} />
        </div>
        <div className="grid gap-1 flex-1">
          {title && <div className="text-sm font-semibold leading-tight">{title}</div>}
          {description && <div className="text-sm opacity-90 leading-relaxed">{description}</div>}
        </div>
      </div>

      <button
        onClick={handleClose}
        className="absolute right-2 top-2 rounded-full p-1.5 text-current opacity-40 hover:opacity-100 hover:bg-black/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/20 transition-all duration-200 group-hover:opacity-70"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11)
    const duration = toast.duration || 4000
    
    setToasts(prev => [...prev, { ...toast, id }])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * -2}px) scale(${1 - index * 0.02})`,
              zIndex: 1000 - index
            }}
          >
            <Toast
              title={toast.title}
              description={toast.description}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Helper functions for easy toast usage
export const toast = {
  success: (title: string, description?: string) => ({
    type: 'success' as const,
    title,
    description,
  }),

  error: (title: string, description?: string) => ({
    type: 'error' as const,
    title,
    description,
  }),

  warning: (title: string, description?: string) => ({
    type: 'warning' as const,
    title,
    description,
  }),

  info: (title: string, description?: string) => ({
    type: 'info' as const,
    title,
    description,
  }),
}