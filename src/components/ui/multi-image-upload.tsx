'use client'

import * as React from 'react'
import { Upload, X, Image, AlertCircle, GripVertical, Plus } from 'lucide-react'
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

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface UploadedImage {
  id: string
  url: string
  name: string
  isUploading?: boolean
  progress?: number
  error?: string
}

interface MultiImageUploadProps {
  value: string[] // Array of image URLs
  onChange: (urls: string[]) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in MB
  maxImages?: number
  className?: string
  placeholder?: string
  disabled?: boolean
}

interface SortableImageItemProps {
  image: UploadedImage
  onRemove: (id: string) => void
  disabled: boolean
}

function SortableImageItem({ image, onRemove, disabled }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group border rounded-lg overflow-hidden bg-gray-50',
        isDragging && 'z-50 rotate-1 shadow-lg'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-black/50 rounded text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(image.id)}
        disabled={disabled || image.isUploading}
        className="absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Image Preview */}
      <div className="aspect-square w-full relative">
        {image.url && !image.isUploading ? (
          <img
            src={image.url}
            alt={image.name || 'Uploaded image'}
            className="w-full h-full object-cover"
            onError={() => {
              console.log('Image failed to load:', image.url)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {image.isUploading ? (
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-gray-600">Đang tải...</p>
                {image.progress && (
                  <div className="w-16 mx-auto">
                    <Progress value={image.progress} className="h-1" />
                  </div>
                )}
              </div>
            ) : (
              <Image className="h-8 w-8 text-gray-400" aria-label="Image placeholder" />
            )}
          </div>
        )}

        {/* Error Overlay */}
        {image.error && (
          <div className="absolute inset-0 bg-red-50 border-2 border-red-200 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-red-600">{image.error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {image.isUploading && image.progress && (
        <div className="absolute bottom-0 left-0 right-0">
          <Progress value={image.progress} className="h-1 rounded-none" />
        </div>
      )}
    </div>
  )
}

export function MultiImageUpload({
  value = [],
  onChange,
  onError,
  accept = 'image/*',
  maxSize = 5,
  maxImages = 10,
  className,
  placeholder = 'Thêm hình ảnh',
  disabled = false
}: MultiImageUploadProps) {
  const [images, setImages] = React.useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Get auth token from Redux store
  const { token } = useAuth()

  // Initialize images from value prop
  React.useEffect(() => {
    // Ensure value is an array before calling map
    if (!Array.isArray(value)) {
      setImages([])
      return
    }

    const initialImages: UploadedImage[] = value.map((url, index) => ({
      id: `image-${index}-${Date.now()}`,
      url,
      name: `Image ${index + 1}`,
    }))
    setImages(initialImages)
  }, [value]) // Re-run when value changes

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files)

    // Check if adding these files would exceed the limit
    const currentImageCount = images.filter(img => !img.error).length
    const totalAfterUpload = currentImageCount + fileArray.length

    if (totalAfterUpload > maxImages) {
      onError?.(`Tối đa ${maxImages} hình ảnh. Hiện có ${currentImageCount} ảnh.`)
      return
    }

    for (const file of fileArray) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(`File "${file.name}" quá lớn. Tối đa ${maxSize}MB`)
        continue
      }

      // Validate file type
      if (accept.includes('image/') && !file.type.startsWith('image/')) {
        onError?.(`File "${file.name}" không phải hình ảnh`)
        continue
      }

      const imageId = `upload-${Date.now()}-${Math.random()}`
      const objectUrl = URL.createObjectURL(file)

      // Add uploading image to state
      const uploadingImage: UploadedImage = {
        id: imageId,
        url: objectUrl,
        name: file.name,
        isUploading: true,
        progress: 0,
      }

      setImages(prev => {
        const newImages = [...prev, uploadingImage]
        return newImages
      })

      try {
        // Check if user is authenticated and has token
        if (!token) {
          throw new Error('Không tìm thấy token xác thực')
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setImages(prev => prev.map(img =>
            img.id === imageId
              ? { ...img, progress: Math.min((img.progress || 0) + 10, 90) }
              : img
          ))
        }, 100)

        // Upload to API
        const result = await apiClient.uploadEditorFile(file, file.name) as UploadResult

        clearInterval(progressInterval)

        if (result.success && result.data?.file_url) {
          // Clean up object URL and update with real URL
          URL.revokeObjectURL(objectUrl)
          setImages(prev => {
            const newImages = prev.map(img =>
              img.id === imageId
                ? { ...img, url: result.data.file_url, isUploading: false, progress: 100 }
                : img
            )
            // Trigger onChange for successful uploads
            const urls = newImages.filter(img => img.url && !img.isUploading && !img.error).map(img => img.url)
            onChange(urls)
            return newImages
          })
        } else {
          throw new Error('Không nhận được URL file')
        }

      } catch (error) {
        console.error('Upload error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Upload thất bại'

        setImages(prev => prev.map(img =>
          img.id === imageId
            ? { ...img, isUploading: false, error: errorMessage, progress: 0 }
            : img
        ))

        // Clean up object URL on error
        URL.revokeObjectURL(objectUrl)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
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

  const handleRemove = (imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove?.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      const newImages = prev.filter(img => img.id !== imageId)
      // Trigger onChange for removal
      const urls = newImages.filter(img => img.url && !img.isUploading && !img.error).map(img => img.url)
      onChange(urls)
      return newImages
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)
        const newImages = arrayMove(items, oldIndex, newIndex)

        // Trigger onChange for reordering
        const urls = newImages.filter(img => img.url && !img.isUploading && !img.error).map(img => img.url)
        onChange(urls)
        return newImages
      })
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const canAddMore = images.filter(img => !img.error).length < maxImages

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || !canAddMore}
        multiple
      />

      {/* Upload Area */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500">
                Kéo thả nhiều file vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tối đa {maxImages} ảnh • {maxSize}MB mỗi ảnh • JPEG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map(img => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    onRemove={handleRemove}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add More Button */}
          {canAddMore && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={disabled}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm ảnh ({images.filter(img => !img.error).length}/{maxImages})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}