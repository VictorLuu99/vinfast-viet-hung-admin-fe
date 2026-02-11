'use client'

const SITE_PREVIEW_URL = 'https://vinfastviethung.com'

interface GooglePreviewSnippetProps {
  title: string
  description: string
  /** Path only, e.g. "/news/khuyen-mai-thang-3" or "/products/klara-s" */
  path: string
}

export function GooglePreviewSnippet({ title, description, path }: GooglePreviewSnippetProps) {
  const displayTitle = title.trim() || 'Tiêu đề trang'
  const displayDesc = description.trim() || 'Mô tả sẽ hiển thị tại đây.'
  const fullUrl = `${SITE_PREVIEW_URL}${path.startsWith('/') ? path : `/${path}`}`

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
      <p className="text-xs font-medium text-gray-500 mb-2">Xem thử trên Google</p>
      <div className="bg-white border border-gray-200 rounded p-3 shadow-sm font-sans text-sm">
        <div className="text-blue-700 hover:underline cursor-default truncate">
          {displayTitle}
        </div>
        <div className="text-green-700 text-xs mt-0.5 truncate">
          {fullUrl}
        </div>
        <div className="text-gray-600 mt-1 line-clamp-2">
          {displayDesc}
        </div>
      </div>
    </div>
  )
}
