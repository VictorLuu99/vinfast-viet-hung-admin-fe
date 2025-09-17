'use client'

import React, { useMemo, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'

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
}

export function ReactQuillEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  disabled = false,
  label,
  required = false,
  className = ''
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

  // Initialize Quill
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
        quillInstance.current = null
        isInitialized.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, formats, placeholder, disabled])

  // Update content when value prop changes
  useEffect(() => {
    if (quillInstance.current && isInitialized.current) {
      const currentContent = quillInstance.current.root.innerHTML
      if (currentContent !== value) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(value || '')
      }
    }
  }, [value])

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