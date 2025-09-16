'use client'

import * as React from 'react'
import { Upload, X, Image } from 'lucide-react'
import { Button } from './button'
import { Progress } from './progress'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/apiClient'

interface UploadResult {
  success: boolean
  data: {
    file_url: string
    filename: string
    original_name: string
    file_size: number
  }
  error?: string
}

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function FileUpload({
  value,
  onChange,
  onError,
  accept = 'image/*',
  maxSize = 5,
  className,
  placeholder = 'Chọn file để tải lên',
  disabled = false
}: FileUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [dragActive, setDragActive] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string>(value || '')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Get auth token from Redux store
  const { token } = useAuth()

  React.useEffect(() => {
    setPreviewUrl(value || '')
  }, [value])

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `Kích thước file quá lớn. Tối đa ${maxSize}MB`
      onError?.(error)
      return
    }

    // Validate file type
    if (accept.includes('image/') && !file.type.startsWith('image/')) {
      const error = 'Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP)'
      onError?.(error)
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Check if user is authenticated and has token
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      // Create preview URL immediately
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Simulate progress (since we can't track actual upload progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Upload to API
      const result = await apiClient.uploadEditorFile(file, file.name) as UploadResult

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success && result.data?.file_url) {
        // Clean up object URL and set real URL
        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(result.data.file_url)
        onChange(result.data.file_url)
      } else {
        throw new Error('Không nhận được URL file')
      }

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload thất bại'
      onError?.(errorMessage)

      // Reset preview on error
      setPreviewUrl(value || '')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemove = () => {
    setPreviewUrl('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Area */}
      {!previewUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={!disabled && !isUploading ? openFileDialog : undefined}
        >
          {isUploading ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-sm text-gray-600">Đang tải lên...</p>
              {uploadProgress > 0 && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-500">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tối đa {maxSize}MB • {accept.includes('image/') ? 'JPEG, PNG, GIF, WebP' : 'Tất cả định dạng'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Area */}
      {previewUrl && (
        <div className="relative border rounded-lg p-4">
          <div className="flex items-start gap-3">
            {/* Image Preview */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {previewUrl.startsWith('data:') || previewUrl.includes('blob:') || previewUrl.includes('http') ? (
                  <img
                    src={previewUrl}
                    alt="File preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.log('Image failed to load:', previewUrl)
                    }}
                  />
                ) : (
                  <Image className="h-6 w-6 text-gray-400" aria-label="File placeholder" />
                )}
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Ảnh đã tải lên
              </p>
              <p className="text-xs text-gray-500">
                {previewUrl.startsWith('http') ? 'Đã lưu trên server' : 'Đang xử lý...'}
              </p>
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {!previewUrl && !isUploading && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled}
            className="text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Chọn file
          </Button>
        </div>
      )}
    </div>
  )
}