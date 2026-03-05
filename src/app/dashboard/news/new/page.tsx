'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

const vietnameseCategories = [
  { value: 'tin-cong-ty', label: 'Tin công ty' },
  { value: 'san-pham-dich-vu', label: 'Sản phẩm & Dịch vụ' },
  { value: 'su-kien', label: 'Sự kiện' },
  { value: 'khuyen-mai', label: 'Khuyến mại' },
  { value: 'tin-tuc-nganh', label: 'Tin tức ngành' }
]

const initialFormData = {
  title: '',
  content: '',
  excerpt: '',
  featured_image: '',
  category: 'tin-cong-ty',
  published: 0,
  meta_title: '',
  meta_description: '',
  keywords: ''
}

export default function NewsNewPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [formData, setFormData] = React.useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [focusKeyword, setFocusKeyword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      const response = await apiClient.createNews(formData)
      if (response.success) {
        showToast(toast.success('Tạo thành công', 'Tin tức mới đã được tạo'))
        router.push('/dashboard/news')
      } else {
        const errorMsg = response.error || 'Không thể tạo tin tức'
        setError(errorMsg)
        showToast(toast.error('Lỗi tạo mới', errorMsg))
      }
    } catch (err) {
      console.error('Error creating news:', err)
      const errorMsg = 'Có lỗi xảy ra khi lưu tin tức'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/news">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tạo tin tức mới</h2>
          <p className="text-gray-600">Tạo bài viết mới cho VinFast VietHung</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo tin tức mới</CardTitle>
          <CardDescription>Tạo bài viết mới cho VinFast VietHung</CardDescription>
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
                path={`/news/${formData.title.trim() ? formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u00C0-\u024F-]/gi, '').slice(0, 80) : 'tin-tuc'}`}
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
              focusKeyword={focusKeyword}
              onFocusKeywordChange={setFocusKeyword}
            />

            <div className="flex gap-3 pt-4 border-t">
              <Link href="/dashboard/news">
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
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Tạo mới
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
