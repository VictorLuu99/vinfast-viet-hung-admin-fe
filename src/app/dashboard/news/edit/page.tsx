'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { FileUpload } from '@/components/ui/file-upload'
import { ReactQuillEditor } from '@/components/ui/react-quill-editor'
import { SeoScorePanel } from '@/components/seo/SeoScorePanel'
import { MetaLengthHint } from '@/components/seo/MetaLengthHint'
import { GooglePreviewSnippet } from '@/components/seo/GooglePreviewSnippet'

interface NewsArticle {
  id: number
  title: string
  slug?: string
  content: string
  excerpt?: string
  featured_image?: string
  category: string
  published: number
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string | null
  focus_keyword?: string | null
  created_at: string
  updated_at: string
}

const vietnameseCategories = [
  { value: 'tin-cong-ty', label: 'Tin công ty' },
  { value: 'san-pham-dich-vu', label: 'Sản phẩm & Dịch vụ' },
  { value: 'su-kien', label: 'Sự kiện' },
  { value: 'khuyen-mai', label: 'Khuyến mại' },
  { value: 'tin-tuc-nganh', label: 'Tin tức ngành' }
]

function NewsEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') ?? ''
  const { showToast } = useToast()
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: 'tin-cong-ty',
    published: 0,
    meta_title: '',
    meta_description: '',
    keywords: '',
    focus_keyword: ''
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [article, setArticle] = React.useState<NewsArticle | null>(null)

  React.useEffect(() => {
    if (!id) {
      router.replace('/dashboard/news/')
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getNews({ page: 1, limit: 500 })
        if (!response.success || !response.data) {
          router.replace('/dashboard/news/')
          return
        }
        const list = response.data as NewsArticle[]
        const found = list.find((a) => String(a.id) === id)
        if (cancelled) return
        if (!found) {
          router.replace('/dashboard/news/')
          return
        }
        setArticle(found)
        setFormData({
          title: found.title,
          content: found.content,
          excerpt: found.excerpt || '',
          featured_image: found.featured_image || '',
          category: found.category,
          published: found.published,
          meta_title: found.meta_title ?? '',
          meta_description: found.meta_description ?? '',
          keywords: found.keywords ?? '',
          focus_keyword: found.focus_keyword ?? ''
        })
      } catch {
        if (!cancelled) router.replace('/dashboard/news/')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      setIsSubmitting(true)
      setError(null)
      const response = await apiClient.updateNews(id, formData)
      if (response.success) {
        showToast(toast.success('Cập nhật thành công', 'Tin tức đã được cập nhật'))
        router.push('/dashboard/news/')
      } else {
        const errorMsg = response.error || 'Không thể cập nhật tin tức'
        setError(errorMsg)
        showToast(toast.error('Lỗi cập nhật', errorMsg))
      }
    } catch (err) {
      console.error('Error updating news:', err)
      const errorMsg = 'Có lỗi xảy ra khi lưu tin tức'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!id || !article) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/news/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tức</h2>
          <p className="text-gray-600">Cập nhật thông tin bài viết</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa tin tức</CardTitle>
          <CardDescription>Cập nhật thông tin bài viết</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề bài viết"
                required
                className="w-full max-w-full overflow-x-auto transition-[font-size] duration-150"
                style={{
                  fontSize: formData.title.length > 150 ? '11px' : formData.title.length > 100 ? '12px' : formData.title.length > 60 ? '14px' : undefined
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {vietnameseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="published">Trạng thái</Label>
                <Select value={formData.published.toString()} onValueChange={(value) => setFormData((prev) => ({ ...prev, published: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Bản nháp</SelectItem>
                    <SelectItem value="1">Đã xuất bản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Mô tả ngắn</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Mô tả ngắn gọn về bài viết"
                rows={2}
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">SEO (tìm kiếm & chia sẻ)</h4>
              <div className="space-y-2">
                <Label htmlFor="meta_title">Tiêu đề SEO</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="VD: Khuyến mãi tháng 3 | VinFast Việt Hùng"
                />
                <MetaLengthHint value={formData.meta_title} type="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Mô tả SEO</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="1-2 câu tóm tắt có từ khóa VinFast, xe máy điện, Việt Hùng"
                  rows={2}
                />
                <MetaLengthHint value={formData.meta_description} type="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Từ khóa (cách nhau dấu phẩy)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                  placeholder="VinFast, xe máy điện, Việt Hùng, khuyến mãi"
                />
              </div>
              <GooglePreviewSnippet
                title={formData.meta_title || formData.title}
                description={formData.meta_description || formData.excerpt}
                path={article.slug ? `/news/${article.slug}` : `/news/${formData.title.trim() ? formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u00C0-\u024F-]/gi, '').slice(0, 80) : 'tin-tuc'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_image">Ảnh đại diện</Label>
              <FileUpload
                value={formData.featured_image}
                onChange={(url) => {
                  setFormData((prev) => ({ ...prev, featured_image: url }))
                  setUploadError(null)
                }}
                onError={(err) => {
                  setUploadError(err)
                  showToast(toast.error('Lỗi tải ảnh', err))
                }}
                accept="image/*"
                maxSize={5}
                placeholder="Chọn ảnh đại diện cho bài viết"
                disabled={isSubmitting}
              />
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            </div>

            <div className="space-y-2">
              <ReactQuillEditor
                value={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                placeholder="Nhập nội dung bài viết..."
                label="Nội dung"
                required
                disabled={isSubmitting}
              />
            </div>

            <SeoScorePanel
              type="news"
              formValues={{
                h1Title: formData.title,
                contentHtml: formData.content,
                metaTitle: formData.meta_title,
                metaDescription: formData.meta_description,
                keywords: formData.keywords,
                featuredImageUrl: formData.featured_image || undefined
              }}
              focusKeyword={formData.focus_keyword}
              onFocusKeywordChange={(v) => setFormData((prev) => ({ ...prev, focus_keyword: v }))}
            />

            <div className="flex gap-3 pt-4 border-t">
              <Link href="/dashboard/news/">
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewsEditPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <NewsEditContent />
    </React.Suspense>
  )
}
