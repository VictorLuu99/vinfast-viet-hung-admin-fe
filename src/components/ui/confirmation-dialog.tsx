'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react'

export interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'warning' | 'info' | 'success'
  isLoading?: boolean
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconClass: 'text-red-600',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    accentClass: 'bg-gradient-to-b from-red-400 to-red-600'
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-yellow-600',
    confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    accentClass: 'bg-gradient-to-b from-yellow-400 to-yellow-600'
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-600',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    accentClass: 'bg-gradient-to-b from-blue-400 to-blue-600'
  },
  success: {
    icon: CheckCircle,
    iconClass: 'text-green-600',
    confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
    accentClass: 'bg-gradient-to-b from-green-400 to-green-600'
  }
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'destructive',
  isLoading = false
}) => {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
        {/* Accent line */}
        <div className={`h-1 w-full ${config.accentClass}`} />

        <div className="p-6">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-gray-100">
              <Icon className={`h-8 w-8 ${config.iconClass}`} />
            </div>

            <DialogTitle className="text-xl font-bold text-gray-900">
              {title}
            </DialogTitle>

            <DialogDescription className="text-gray-600 text-base leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 font-medium border-gray-300 hover:bg-gray-50"
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-11 font-medium ${config.confirmClass} disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Đang xử lý...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easier usage
export const useConfirmationDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'destructive' | 'warning' | 'info' | 'success'
    isLoading?: boolean
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const showConfirmation = React.useCallback((options: {
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'destructive' | 'warning' | 'info' | 'success'
  }) => {
    setDialogState({
      open: true,
      ...options,
      isLoading: false
    })
  }, [])

  const closeDialog = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false }))
  }, [])

  const handleConfirm = React.useCallback(async () => {
    try {
      setDialogState(prev => ({ ...prev, isLoading: true }))
      await dialogState.onConfirm()
      closeDialog()
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setDialogState(prev => ({ ...prev, isLoading: false }))
    }
  }, [dialogState.onConfirm, dialogState, closeDialog])

  const ConfirmationDialogComponent = React.useCallback(() => (
    <ConfirmationDialog
      open={dialogState.open}
      onClose={closeDialog}
      onConfirm={handleConfirm}
      title={dialogState.title}
      description={dialogState.description}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      variant={dialogState.variant}
      isLoading={dialogState.isLoading}
    />
  ), [dialogState, closeDialog, handleConfirm])

  return {
    showConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent
  }
}

// Pre-configured confirmation types
export const confirmations = {
  delete: (itemName: string, onConfirm: () => void) => ({
    title: 'Xác nhận xóa',
    description: `Bạn có chắc chắn muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`,
    confirmText: 'Xóa',
    cancelText: 'Hủy bỏ',
    variant: 'destructive' as const,
    onConfirm
  }),

  deleteGeneric: (onConfirm: () => void) => ({
    title: 'Xác nhận xóa',
    description: 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
    confirmText: 'Xóa',
    cancelText: 'Hủy bỏ',
    variant: 'destructive' as const,
    onConfirm
  }),

  publish: (itemName: string, onConfirm: () => void) => ({
    title: 'Xác nhận xuất bản',
    description: `Bạn có chắc chắn muốn xuất bản "${itemName}"? Nội dung sẽ hiển thị công khai.`,
    confirmText: 'Xuất bản',
    cancelText: 'Hủy bỏ',
    variant: 'success' as const,
    onConfirm
  }),

  unpublish: (itemName: string, onConfirm: () => void) => ({
    title: 'Xác nhận hủy xuất bản',
    description: `Bạn có chắc chắn muốn hủy xuất bản "${itemName}"? Nội dung sẽ không còn hiển thị công khai.`,
    confirmText: 'Hủy xuất bản',
    cancelText: 'Hủy bỏ',
    variant: 'warning' as const,
    onConfirm
  })
}