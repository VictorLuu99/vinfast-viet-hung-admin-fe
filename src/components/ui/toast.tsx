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
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[type]

  const toastClasses = cn(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
    {
      'border-green-200 bg-green-50 text-green-900': type === 'success',
      'border-red-200 bg-red-50 text-red-900': type === 'error', 
      'border-yellow-200 bg-yellow-50 text-yellow-900': type === 'warning',
      'border-blue-200 bg-blue-50 text-blue-900': type === 'info'
    }
  )

  const iconClasses = cn('h-5 w-5 shrink-0', {
    'text-green-600': type === 'success',
    'text-red-600': type === 'error',
    'text-yellow-600': type === 'warning', 
    'text-blue-600': type === 'info'
  })

  return (
    <div className={toastClasses}>
      <div className="flex items-start space-x-3">
        <Icon className={iconClasses} />
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute right-1 top-1 rounded-md p-1 text-current opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
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
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 w-full max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}