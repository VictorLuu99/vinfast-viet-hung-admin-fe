'use client'

import * as React from 'react'
import { ColorTabs, ColorVariant } from './color-tabs'
import { MultiImageUpload } from './multi-image-upload'
import { Card, CardContent } from './card'
import { cn } from '@/lib/utils'

// Predefined Vietnamese color palette for VinFast products
const DEFAULT_COLORS = [
  'Hồng',
  'Đen',
  'Trắng',
  'Đỏ',
  'Vàng',
  'Đỏ Tươi',
  'Đen Nhám',
  'Xanh Tím Than',
  'Trắng Ngọc Trai',
  'Xanh Rêu',
  'Xanh Dương',
  'Xám',
  'Bạc'
]

const DEFAULT_COLOR = 'Trắng'

interface ImageGalleryProps {
  value: Record<string, string[]> // { colorName: [imageUrls] }
  onChange: (colorVariants: Record<string, string[]>) => void
  colors?: string[] // Available color names (optional, uses DEFAULT_COLORS if not provided)
  onError?: (error: string) => void
  maxImagesPerColor?: number
  maxImageSize?: number
  disabled?: boolean
  className?: string
}

export function ImageGallery({
  value = {},
  onChange,
  colors,
  onError,
  maxImagesPerColor = 10,
  maxImageSize = 5,
  disabled = false,
  className
}: ImageGalleryProps) {
  // Use predefined colors if none provided
  const availableColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS

  // Convert value to ColorVariant format
  const colorVariants: ColorVariant[] = React.useMemo(() => {
    const allColors = new Set([...Object.keys(value), ...availableColors])
    return Array.from(allColors).map(colorName => ({
      name: colorName,
      images: value[colorName] || []
    }))
  }, [value, availableColors])

  // Ensure we have at least one color (default to 'Trắng')
  React.useEffect(() => {
    if (colorVariants.length === 0) {
      onChange({ [DEFAULT_COLOR]: [] })
    }
  }, [colorVariants.length, onChange])

  const [selectedColor, setSelectedColor] = React.useState<string>(() => {
    // Priority: 1. First color with images, 2. 'Trắng' if available, 3. First available color
    const colorWithImages = colorVariants.find(c => c.images.length > 0)
    if (colorWithImages) return colorWithImages.name

    const defaultColorExists = colorVariants.find(c => c.name === DEFAULT_COLOR)
    if (defaultColorExists) return DEFAULT_COLOR

    return colorVariants[0]?.name || DEFAULT_COLOR
  })

  // Ensure selected color exists
  React.useEffect(() => {
    if (selectedColor && !colorVariants.find(c => c.name === selectedColor)) {
      const firstColor = colorVariants[0]
      if (firstColor) {
        setSelectedColor(firstColor.name)
      }
    }
  }, [selectedColor, colorVariants])

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName)
  }

  const handleColorAdd = (colorName: string) => {
    const newValue = { ...value, [colorName]: [] }
    onChange(newValue)
  }

  const handleColorRemove = (colorName: string) => {
    const newValue = { ...value }
    delete newValue[colorName]
    onChange(newValue)
  }

  const handleColorRename = (oldName: string, newName: string) => {
    const newValue = { ...value }
    if (newValue[oldName]) {
      newValue[newName] = newValue[oldName]
      delete newValue[oldName]
      onChange(newValue)
    }
  }

  const handleImagesChange = (images: string[]) => {
    if (selectedColor) {
      const newValue = { ...value, [selectedColor]: images }
      onChange(newValue)
    }
  }

  const selectedColorImages = React.useMemo(() => {
    if (!selectedColor) {
      console.log('  - No selectedColor, returning empty array')
      return []
    }

    const images = value[selectedColor]
    const result = Array.isArray(images) ? images : []

    return result
  }, [selectedColor, value])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Color Management */}
      <ColorTabs
        colors={colorVariants}
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
        onColorAdd={handleColorAdd}
        onColorRemove={handleColorRemove}
        onColorRename={handleColorRename}
        disabled={disabled}
      />

      {/* Image Upload for Selected Color */}
      {selectedColor && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Hình ảnh cho màu: <span className="text-blue-600">{selectedColor}</span>
                </h4>
                {selectedColorImages.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {selectedColorImages.length} / {maxImagesPerColor} ảnh
                  </span>
                )}
              </div>

              <MultiImageUpload
                value={selectedColorImages}
                onChange={handleImagesChange}
                onError={onError}
                maxImages={maxImagesPerColor}
                maxSize={maxImageSize}
                placeholder={`Thêm ảnh cho màu ${selectedColor}`}
                disabled={disabled}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>Tổng quan:</strong> {colorVariants.length} màu,{' '}
          {Object.values(value).flat().length} ảnh
        </p>
        {Object.entries(value).map(([color, images]) => (
          images.length > 0 && (
            <p key={color}>
              • {color}: {images.length} ảnh
            </p>
          )
        ))}
      </div>
    </div>
  )
}