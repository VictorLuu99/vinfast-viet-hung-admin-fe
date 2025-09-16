'use client'

import * as React from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Badge } from './badge'
import { X, Plus, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

// Predefined Vietnamese color palette for VinFast products
const PREDEFINED_COLORS = [
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

export interface ColorVariant {
  name: string
  images: string[]
}

interface ColorTabsProps {
  colors: ColorVariant[]
  selectedColor: string
  onColorSelect: (colorName: string) => void
  onColorAdd: (colorName: string) => void
  onColorRemove: (colorName: string) => void
  onColorRename: (oldName: string, newName: string) => void
  disabled?: boolean
  className?: string
}

export function ColorTabs({
  colors,
  selectedColor,
  onColorSelect,
  onColorAdd,
  onColorRemove,
  onColorRename,
  disabled = false,
  className
}: ColorTabsProps) {
  const [isAddingColor, setIsAddingColor] = React.useState(false)
  const [newColorName, setNewColorName] = React.useState('')
  const [editingColor, setEditingColor] = React.useState<string | null>(null)
  const [editColorName, setEditColorName] = React.useState('')

  // Get available colors that haven't been used yet
  const availableColors = React.useMemo(() => {
    const usedColors = colors.map(c => c.name)
    return PREDEFINED_COLORS.filter(color => !usedColors.includes(color))
  }, [colors])

  const handleAddColor = () => {
    if (newColorName.trim() && !colors.find(c => c.name === newColorName.trim())) {
      onColorAdd(newColorName.trim())
      setNewColorName('')
      setIsAddingColor(false)
      // Auto-select the new color
      onColorSelect(newColorName.trim())
    }
  }

  const handleQuickAddColor = (colorName: string) => {
    if (!colors.find(c => c.name === colorName)) {
      onColorAdd(colorName)
      // Auto-select the new color
      onColorSelect(colorName)
    }
  }

  const handleStartEdit = (colorName: string) => {
    setEditingColor(colorName)
    setEditColorName(colorName)
  }

  const handleSaveEdit = () => {
    if (editColorName.trim() && editColorName.trim() !== editingColor && editingColor) {
      if (!colors.find(c => c.name === editColorName.trim())) {
        onColorRename(editingColor, editColorName.trim())
        // Update selected color if it was the one being edited
        if (selectedColor === editingColor) {
          onColorSelect(editColorName.trim())
        }
      }
    }
    setEditingColor(null)
    setEditColorName('')
  }

  const handleCancelEdit = () => {
    setEditingColor(null)
    setEditColorName('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      if (action === 'add') {
        handleAddColor()
      } else {
        handleSaveEdit()
      }
    } else if (e.key === 'Escape') {
      if (action === 'add') {
        setIsAddingColor(false)
        setNewColorName('')
      } else {
        handleCancelEdit()
      }
    }
  }

  console.log("colors: ", colors);
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Màu sắc và hình ảnh
        </Label>
        <Badge variant="secondary" className="text-xs">
          {colors.length} màu
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name
          const imageCount = color.images.length

          return editingColor === color.name ? (
            // Edit mode
            <div key={color.name} className="flex items-center gap-1">
              <Input
                value={editColorName}
                onChange={(e) => setEditColorName(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'edit')}
                className="h-8 w-24 text-xs"
                placeholder="Tên màu"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSaveEdit}
                className="h-8 px-2"
              >
                ✓
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-8 px-2"
              >
                ✕
              </Button>
            </div>
          ) : (
            // Display mode
            <div
              key={color.name}
              className={cn(
                'group relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !disabled && onColorSelect(color.name)}
            >
              <span className="text-sm font-medium">{color.name}</span>
              {imageCount > 0 && (
                <Badge
                  variant={isSelected ? 'default' : 'secondary'}
                  className="text-xs h-5 px-1.5"
                >
                  {imageCount}
                </Badge>
              )}

              {/* Edit button */}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartEdit(color.name)
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                ✏️
              </Button>

              {/* Remove button - only show if more than 1 color */}
              {colors.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onColorRemove(color.name)
                    // Select another color if this was selected
                    if (selectedColor === color.name) {
                      const remainingColors = colors.filter(c => c.name !== color.name)
                      if (remainingColors.length > 0) {
                        onColorSelect(remainingColors[0].name)
                      }
                    }
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        })}

        {/* Quick add predefined colors */}
        {availableColors.length > 0 && (
          <Select onValueChange={handleQuickAddColor} disabled={disabled}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Chọn màu" />
            </SelectTrigger>
            <SelectContent>
              {availableColors.map((color) => (
                <SelectItem key={color} value={color} className="text-xs">
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Add custom color */}
        {isAddingColor ? (
          <div className="flex items-center gap-1">
            <Input
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'add')}
              className="h-8 w-24 text-xs"
              placeholder="Tên màu khác"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddColor}
              className="h-8 px-2"
              disabled={!newColorName.trim() || colors.some(c => c.name === newColorName.trim())}
            >
              ✓
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddingColor(false)
                setNewColorName('')
              }}
              className="h-8 px-2"
            >
              ✕
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAddingColor(true)}
            disabled={disabled}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Màu khác
          </Button>
        )}
      </div>

      {/* Selected color info */}
      {selectedColor && (
        <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <span className="font-medium">Đang chỉnh sửa:</span> {selectedColor}
          {colors.find(c => c.name === selectedColor)?.images.length === 0 && (
            <span className="text-orange-600 ml-2">• Chưa có hình ảnh</span>
          )}
        </div>
      )}
    </div>
  )
}