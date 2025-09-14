'use client'

import React, { useRef } from 'react'
import type { ApiResponse } from '@/lib/apiClient'
import { Editor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { 
  Image, 
  FileText, 
  Clock, 
  BarChart3,
  Loader2
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  height?: number
  language?: 'en' | 'cn' | 'vn'
  onAnalytics?: (analytics: ContentAnalytics) => void
}

interface ContentAnalytics {
  wordCount: number
  readingTime: number
  imageCount: number
  characterCount: number
}

interface ImageUploadResult {
  success: boolean
  data: {
    file_url: string
    filename: string
    original_name: string
    file_size: number
  }
  error?: string
}

interface PreviewData {
  sanitized_html: string
  word_count: number
  reading_time: number
  images: Array<{ src: string; alt: string }>
  validation: {
    valid: boolean
    warnings: string[]
    errors: string[]
  }
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter your content...',
  disabled = false,
  height = 400,
  onAnalytics
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isUploading, setIsUploading] = React.useState(false)
  const [analytics, setAnalytics] = React.useState<ContentAnalytics>({
    wordCount: 0,
    readingTime: 0,
    imageCount: 0,
    characterCount: 0
  })

  // Keep latest onAnalytics in a ref to avoid effect dependency churn
  const onAnalyticsRef = React.useRef(onAnalytics)
  React.useEffect(() => {
    onAnalyticsRef.current = onAnalytics
  }, [onAnalytics])

  // Calculate content analytics (stable callback)
  const calculateAnalytics = React.useCallback((content: string) => {
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = textContent ? textContent.split(' ').length : 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)) // 200 WPM average
    const imageCount = (content.match(/<img/gi) || []).length
    const characterCount = content.length

    const newAnalytics = {
      wordCount,
      readingTime,
      imageCount,
      characterCount
    }

    setAnalytics(newAnalytics)
    onAnalyticsRef.current?.(newAnalytics)
  }, [])

  // Handle content change
  const handleChange = (content: string) => {
    onChange(content)
    calculateAnalytics(content)
  }

  // Image upload handler for TinyMCE
  const handleImageUpload = async (blobInfo: { blob: () => File; filename: () => string }, success: (url: string) => void, failure: (err: string) => void) => {
    if (!user) {
      failure('Authentication required')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', blobInfo.blob(), blobInfo.filename())

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/editor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const result: ImageUploadResult = await response.json()
      
      if (result.success) {
        success(result.data.file_url)
        showToast({
          type: 'success',
          title: 'Success',
          description: 'Image uploaded successfully'
        })
      } else {
        failure(result.error || 'Upload failed')
        showToast({
          type: 'error',
          title: 'Upload Failed',
          description: result.error || 'Failed to upload image'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      failure(errorMessage)
      showToast({
        type: 'error',
        title: 'Upload Error',
        description: errorMessage
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Preview content in new window
  const handlePreview = async () => {
    if (!value.trim()) {
      showToast({
        type: 'warning',
        title: 'No Content',
        description: 'Please add some content to preview'
      })
      return
    }

    try {
      const response = (await apiClient.previewContent({
        content_html: value,
        content_type: 'rich'
      })) as ApiResponse<PreviewData>

      if (response.success) {
        const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes')
        if (previewWindow) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Content Preview</title>
              <meta charset="utf-8">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  color: #333;
                }
                img { max-width: 100%; height: auto; }
                h1, h2, h3, h4, h5, h6 { color: #2d3748; margin-top: 1.5em; }
                .preview-header {
                  background: #f7fafc;
                  padding: 1rem;
                  border-radius: 8px;
                  margin-bottom: 2rem;
                  border-left: 4px solid #4299e1;
                }
                .stats {
                  display: flex;
                  gap: 1rem;
                  margin-top: 0.5rem;
                  font-size: 0.875rem;
                  color: #718096;
                }
              </style>
            </head>
            <body>
              <div class="preview-header">
                <h2 style="margin: 0 0 0.5rem 0;">Content Preview</h2>
                <div class="stats">
                  <span>📝 ${response.data.word_count} words</span>
                  <span>⏱️ ${response.data.reading_time}m read</span>
                  <span>🖼️ ${response.data.images.length} images</span>
                </div>
              </div>
              <div class="content">
                ${response.data.sanitized_html}
              </div>
            </body>
            </html>
          `)
          previewWindow.document.close()
        }
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Preview Failed',
        description: 'Failed to generate content preview'
      })
    }
  }

  // Calculate analytics on mount and when value changes
  React.useEffect(() => {
    calculateAnalytics(value)
  }, [value, calculateAnalytics])

  return (
    <div className="space-y-4">
      {/* Editor */}
      <div className="relative">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_API_KEY_TINY_ACCOUNT || "ft3bs1ycl6tsxhtsde8alwtfcadsvs8u8gonaibzjj7oy113"}
          onInit={(_evt, editor) => editorRef.current = editor}
          value={value}
          onEditorChange={handleChange}
          disabled={disabled}
          init={{
            height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | image link | preview code | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; }',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            images_upload_handler: ((...args: any[]) => {
              const [blobInfo, success, failure] = args
              handleImageUpload(blobInfo, success, failure).catch(() => { /* ignore */ })
            }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            images_upload_url: `${process.env.NEXT_PUBLIC_API_URL}/api/upload/editor`,
            images_upload_base_path: '',
            images_upload_credentials: true,
            automatic_uploads: true,
            file_picker_types: 'image',
            file_picker_callback: function (callback, _value, meta) {
              if (meta.filetype === 'image') {
                const input = document.createElement('input')
                input.setAttribute('type', 'file')
                input.setAttribute('accept', 'image/*')
                
                input.onchange = function () {
                  const file = (this as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = function () {
                      const img = document.createElement('img') as HTMLImageElement
                      img.onload = function () {
                        callback(reader.result as string, { alt: file.name })
                      }
                      img.src = reader.result as string
                    }
                    reader.readAsDataURL(file)
                  }
                }
                
                input.click()
              }
            },
            setup: (editor) => {
              editor.on('change', () => {
                const content = editor.getContent()
                calculateAnalytics(content)
              })
            },
            placeholder,
            resize: true,
            branding: false,
            promotion: false
          }}
        />
        
        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute top-2 right-2 bg-white border rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading image...
            </div>
          </div>
        )}
      </div>

      {/* Analytics and Actions */}
      <div className="flex items-center justify-between">
        {/* Content Analytics */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{analytics.wordCount} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{analytics.readingTime}m read</span>
          </div>
          <div className="flex items-center gap-1">
            <Image className="w-4 h-4" aria-label="Images icon" />
            <span>{analytics.imageCount} images</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>{analytics.characterCount} chars</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={!value.trim()}
          >
            <FileText className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content Guidelines */}
      {analytics.wordCount > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Content Guidelines:</span>
              <div className="flex items-center gap-4">
                <Badge variant={analytics.wordCount >= 300 ? 'default' : 'secondary'}>
                  {analytics.wordCount >= 300 ? '✓' : '⚠'} Word Count
                </Badge>
                <Badge variant={analytics.imageCount > 0 ? 'default' : 'secondary'}>
                  {analytics.imageCount > 0 ? '✓' : '⚠'} Images
                </Badge>
                <Badge variant={analytics.readingTime <= 5 ? 'default' : 'secondary'}>
                  {analytics.readingTime <= 5 ? '✓' : '⚠'} Reading Time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RichTextEditor