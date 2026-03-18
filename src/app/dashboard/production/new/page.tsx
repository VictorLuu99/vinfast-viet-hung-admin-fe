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
import { ImageGallery } from '@/components/ui/image-gallery'
import { ReactQuillEditor } from '@/components/ui/react-quill-editor'
import { SeoScorePanel } from '@/components/seo/SeoScorePanel'
import { MetaLengthHint } from '@/components/seo/MetaLengthHint'
import { GooglePreviewSnippet } from '@/components/seo/GooglePreviewSnippet'

interface Category {
  id: number
  name: string
  slug: string
  display_name: string
  description: string
}

function validateAndNormalizeColorVariants(data: unknown): Record<string, string[]> {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    } catch {
      /* invalid */
    }
  }
  if (Array.isArray(data)) {
    const converted: Record<string, string[]> = {}
    data.forEach((item, index) => {
      if (typeof item === 'object' && item !== null && 'name' in item && 'images' in item) {
        converted[(item as { name: string }).name] = Array.isArray((item as { images: string[] }).images) ? (item as { images: string[] }).images : []
      } else if (typeof item === 'string') {
        converted[item] = []
      } else {
        converted[`Color_${index}`] = []
      }
    })
    return converted
  }
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Record<string, string[]>
  }
  return { 'Trắng': [] }
}

const initialFormData = {
  name: '',
  category: 'xe-may-dien',
  price: 0,
  original_price: 0,
  discount: 0,
  description: '',
  tagline: '',
  range_km: 0,
  power_w: 0,
  battery_type: '',
  weight_kg: 0,
  max_speed_kmh: 0,
  charging_time: '',
  storage_liters: 0,
  badge: '',
  available: 1,
  priority: 0,
  meta_title: '',
  meta_description: '',
  keywords: '',
  focus_keyword: ''
}

export default function ProductionNewPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [categories, setCategories] = React.useState<Category[]>([])
  const [formData, setFormData] = React.useState(initialFormData)
  const [colorVariants, setColorVariants] = React.useState<Record<string, string[]>>({ 'Trắng': [] })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    apiClient.getProductCategories().then((response) => {
      if (!cancelled && response.success && response.data) {
        setCategories(response.data as Category[])
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const colorVariantsTMP = validateAndNormalizeColorVariants(colorVariants)
    if (Object.keys(colorVariantsTMP).length === 0) {
      setError('Vui lòng thêm ít nhất một màu sắc')
      return
    }
    const colorVariantsJSON = JSON.stringify(colorVariantsTMP)
    const colorsArray = Object.keys(colorVariantsTMP)
    const colorsJSON = JSON.stringify(colorsArray)
    const defaultColor = colorsArray[0] || ''
    const submissionData = {
      ...formData,
      color_variants: colorVariantsJSON,
      colors: colorsJSON,
      default_color: defaultColor
    }
    try {
      setIsSubmitting(true)
      setError(null)
      const response = await apiClient.createProduct(submissionData)
      if (response.success) {
        showToast(toast.success('Tạo thành công', 'Sản phẩm mới đã được tạo'))
        router.push('/dashboard/production')
      } else {
        const errorMsg = response.error || 'Không thể tạo sản phẩm'
        setError(errorMsg)
        showToast(toast.error('Lỗi tạo mới', errorMsg))
      }
    } catch (err) {
      console.error('Error creating product:', err)
      setError('Có lỗi xảy ra khi lưu sản phẩm')
      showToast(toast.error('Lỗi hệ thống', 'Có lỗi xảy ra khi lưu sản phẩm'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/production">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tạo sản phẩm mới</h2>
          <p className="text-gray-600">Tạo sản phẩm mới cho VinFast VietHung</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo sản phẩm mới</CardTitle>
          <CardDescription>Tạo sản phẩm mới cho VinFast VietHung</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên sản phẩm"
                  required
                  className="w-full max-w-full overflow-x-auto transition-[font-size] duration-150"
                  style={{
                    fontSize: formData.name.length > 150 ? '11px' : formData.name.length > 100 ? '12px' : formData.name.length > 60 ? '14px' : undefined
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Giá gốc (VND)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, original_price: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Giảm giá (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Slogan</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="Slogan sản phẩm"
              />
            </div>

            <div className="space-y-2">
              <ReactQuillEditor
                value={formData.description}
                onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                placeholder="Mô tả chi tiết sản phẩm..."
                label="Mô tả chi tiết"
                required
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
                  placeholder="VD: VinFast Klara | Xe máy điện chính hãng - VinFast Việt Hùng"
                />
                <MetaLengthHint value={formData.meta_title} type="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Mô tả SEO</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="1-2 câu có từ khóa VinFast, xe máy điện, Việt Hùng, Vĩnh Phúc"
                  rows={2}
                  className="resize-none"
                />
                <MetaLengthHint value={formData.meta_description} type="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Từ khóa (cách nhau dấu phẩy)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                  placeholder="VinFast Klara, xe máy điện, VinFast Việt Hùng, xe máy điện học sinh"
                />
              </div>
              <GooglePreviewSnippet
                title={formData.meta_title || formData.name}
                description={formData.meta_description || formData.tagline}
                path={`/products/${formData.name.trim() ? formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u00C0-\u024F-]/gi, '').slice(0, 80) : 'san-pham'}`}
              />
            </div>

            <div className="space-y-4">
              <ImageGallery
                value={colorVariants}
                onChange={setColorVariants}
                onError={(err) => {
                  setError(err)
                  showToast(toast.error('Lỗi tải ảnh', err))
                }}
                maxImagesPerColor={10}
                maxImageSize={5}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="range_km">Quãng đường (km)</Label>
                <Input
                  id="range_km"
                  type="number"
                  value={formData.range_km}
                  onChange={(e) => setFormData((prev) => ({ ...prev, range_km: parseInt(e.target.value) || 0 }))}
                  placeholder="80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="power_w">Công suất (W)</Label>
                <Input
                  id="power_w"
                  type="number"
                  value={formData.power_w}
                  onChange={(e) => setFormData((prev) => ({ ...prev, power_w: parseInt(e.target.value) || 0 }))}
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_speed_kmh">Tốc độ tối đa (km/h)</Label>
                <Input
                  id="max_speed_kmh"
                  type="number"
                  value={formData.max_speed_kmh}
                  onChange={(e) => setFormData((prev) => ({ ...prev, max_speed_kmh: parseInt(e.target.value) || 0 }))}
                  placeholder="45"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Trọng lượng (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight_kg: parseInt(e.target.value) || 0 }))}
                  placeholder="80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="charging_time">Thời gian sạc</Label>
                <Input
                  id="charging_time"
                  value={formData.charging_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, charging_time: e.target.value }))}
                  placeholder="4-6 giờ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_liters">Cốp xe (lít)</Label>
                <Input
                  id="storage_liters"
                  type="number"
                  value={formData.storage_liters}
                  onChange={(e) => setFormData((prev) => ({ ...prev, storage_liters: parseInt(e.target.value) || 0 }))}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="battery_type">Loại pin</Label>
                <Input
                  id="battery_type"
                  value={formData.battery_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, battery_type: e.target.value }))}
                  placeholder="Lithium-ion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Nhãn đặc biệt</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Mới, Phổ biến, Bán chạy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available">Trạng thái</Label>
                <Select value={formData.available.toString()} onValueChange={(value) => setFormData((prev) => ({ ...prev, available: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không khả dụng</SelectItem>
                    <SelectItem value="1">Khả dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>

            <SeoScorePanel
              type="product"
              formValues={{
                h1Title: formData.name,
                contentHtml: formData.description,
                metaTitle: formData.meta_title,
                metaDescription: formData.meta_description,
                keywords: formData.keywords
              }}
              focusKeyword={formData.focus_keyword}
              onFocusKeywordChange={(v) => setFormData((prev) => ({ ...prev, focus_keyword: v }))}
            />

            <div className="flex gap-3 pt-4 border-t">
              <Link href="/dashboard/production">
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
