import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Eye, EyeOff } from 'lucide-react'

interface BulletPointTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  maxRows?: number
  required?: boolean
  id?: string
}

export function BulletPointTextarea({
  label,
  value,
  onChange,
  placeholder = "Enter bullet points...",
  minRows = 4,
  maxRows = 10,
  required = false,
  id
}: BulletPointTextareaProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [currentRows, setCurrentRows] = useState(minRows)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Convert value to bullet points array for editing
  const getBulletPoints = () => {
    if (!value) return ['']
    return value.split('\n').filter(line => line.trim())
  }


  const bulletPoints = getBulletPoints()

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const lineCount = value.split('\n').length
      const newRows = Math.max(minRows, Math.min(maxRows, lineCount + 1))
      setCurrentRows(newRows)
    }
  }, [value, minRows, maxRows])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enhanced Enter key behavior for bullet points
    if (e.key === 'Enter') {
      e.preventDefault()
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart
      const beforeCursor = value.substring(0, cursorPos)
      const afterCursor = value.substring(cursorPos)
      
      // Add new line
      const newValue = beforeCursor + '\n' + afterCursor
      onChange(newValue)
      
      // Move cursor to new line
      setTimeout(() => {
        textarea.setSelectionRange(cursorPos + 1, cursorPos + 1)
      }, 0)
    }
  }

  const addBulletPoint = () => {
    const newValue = value ? value + '\n' : ''
    onChange(newValue)
    
    // Focus textarea after adding
    setTimeout(() => {
      textareaRef.current?.focus()
      const length = newValue.length
      textareaRef.current?.setSelectionRange(length, length)
    }, 0)
  }


  const formatValueForDisplay = (text: string) => {
    if (!text) return ''
    return text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim())
      .join('\n')
  }

  const renderPreview = () => {
    const points = getBulletPoints().filter(point => point.trim())
    
    if (points.length === 0) {
      return (
        <div className="text-muted-foreground italic p-4 border border-dashed rounded-lg">
          No bullet points yet. Click &quot;Edit&quot; to add content.
        </div>
      )
    }

    return (
      <div className="space-y-2 p-4 border rounded-lg bg-background">
        {points.map((point, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm">{point.trim()}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderEditor = () => {
    const displayValue = formatValueForDisplay(value)
    
    return (
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            id={id}
            value={displayValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={currentRows}
            className="resize-none font-mono text-sm"
            required={required}
          />
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            {bulletPoints.filter(p => p.trim()).length} points
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBulletPoint}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Point
            </Button>
            
            <span className="text-xs text-muted-foreground">
              Press Enter for new line
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {displayValue.length} characters
          </div>
        </div>

        {bulletPoints.filter(p => p.trim()).length > 0 && (
          <div className="text-xs text-muted-foreground">
            <strong>Tips:</strong> Each line will become a bullet point. Keep points concise and specific.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="text-xs"
        >
          {isPreview ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </>
          )}
        </Button>
      </div>

      {isPreview ? renderPreview() : renderEditor()}
    </div>
  )
}