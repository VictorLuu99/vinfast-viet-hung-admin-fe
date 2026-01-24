'use client'

import React, { useMemo, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/utils'

// Import Quill CSS
import 'react-quill/dist/quill.snow.css'

interface ReactQuillEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  required?: boolean
  className?: string
  onImageUpload?: (file: File) => Promise<string>
}

export function ReactQuillEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  disabled = false,
  label,
  required = false,
  className = '',
  onImageUpload
}: ReactQuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillInstance = useRef<any>(null)
  const isInitialized = useRef(false)

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }), [])

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image',
    'align',
    'color', 'background'
  ]

  // Initialize Quill only once
  useEffect(() => {
    if (typeof window === 'undefined' || !editorRef.current || isInitialized.current) {
      return
    }

    const initQuill = async () => {
      try {
        const Quill = (await import('quill')).default

        if (quillInstance.current) {
          return
        }

        quillInstance.current = new Quill(editorRef.current!, {
          theme: 'snow',
          modules,
          formats,
          placeholder,
          readOnly: disabled
        })

        // Set initial value
        if (value) {
          quillInstance.current.clipboard.dangerouslyPasteHTML(value)
        }

        // Configure image upload handler
        if (onImageUpload || apiClient) {
          const toolbar = quillInstance.current.getModule('toolbar')
          toolbar.addHandler('image', async () => {
            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', 'image/*')
            input.click()

            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return

              const range = quillInstance.current.getSelection(true)
              quillInstance.current.insertText(range.index, 'Đang tải ảnh...', 'user')
              quillInstance.current.setSelection(range.index + 15)

              try {
                let imageUrl: string
                if (onImageUpload) {
                  imageUrl = await onImageUpload(file)
                } else {
                  // Use default apiClient upload
                  const result = await apiClient.uploadEditorFile(file, file.name) as { success: boolean; data: { url: string } }
                  if (result.success && result.data?.url) {
                    imageUrl = result.data.url
                  } else {
                    throw new Error('Upload failed')
                  }
                }

                quillInstance.current.deleteText(range.index, 15)
                quillInstance.current.insertEmbed(range.index, 'image', imageUrl, 'user')
                quillInstance.current.setSelection(range.index + 1)
              } catch (error) {
                quillInstance.current.deleteText(range.index, 15)
                console.error('Image upload failed:', error)
                alert('Không thể tải ảnh. Vui lòng thử lại.')
              }
            }
          })
        }

        // Listen for changes
        quillInstance.current.on('text-change', () => {
          const html = quillInstance.current.root.innerHTML
          const text = quillInstance.current.getText().trim()

          if (text === '' && html === '<p><br></p>') {
            onChange('')
          } else {
            onChange(html)
          }
        })

        isInitialized.current = true
      } catch (error) {
        console.error('Failed to initialize Quill:', error)
      }
    }

    initQuill()

    return () => {
      if (quillInstance.current) {
        // Proper cleanup
        quillInstance.current.off('text-change')
        quillInstance.current = null
        isInitialized.current = false
        // Clear DOM to prevent toolbar duplication
        const editorElement = editorRef.current
        if (editorElement) {
          editorElement.innerHTML = ''
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - initialize only once to prevent toolbar duplication

  // Update content when value prop changes
  useEffect(() => {
    if (quillInstance.current && isInitialized.current) {
      const currentContent = quillInstance.current.root.innerHTML
      if (currentContent !== value) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(value || '')
      }
    }
  }, [value])

  // Update placeholder when it changes
  useEffect(() => {
    if (quillInstance.current && isInitialized.current) {
      // Update placeholder through Quill's root element
      const editor = quillInstance.current.root
      if (editor) {
        editor.dataset.placeholder = placeholder
      }
    }
  }, [placeholder])

  // Update disabled state
  useEffect(() => {
    if (quillInstance.current) {
      quillInstance.current.enable(!disabled)
    }
  }, [disabled])

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <div
          ref={editorRef}
          style={{ minHeight: '200px' }}
          className="quill-editor"
        />
      </div>
      <style jsx global>{`
        .quill-editor .ql-editor {
          min-height: 200px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          font-size: 14px;
          line-height: 1.6;
        }
        .quill-editor .ql-toolbar {
          border-bottom: 1px solid #e5e7eb;
        }
        .quill-editor .ql-container {
          border: none;
        }
        .quill-editor .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        .quill-editor .ql-snow .ql-tooltip {
          z-index: 1000;
        }
      `}</style>
    </div>
  )
}

export default ReactQuillEditor