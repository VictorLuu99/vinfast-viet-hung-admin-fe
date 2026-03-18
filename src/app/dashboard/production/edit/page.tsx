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
import { API_BASE_URL, apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { ImageGallery } from '@/components/ui/image-gallery'
import { ReactQuillEditor } from '@/components/ui/react-quill-editor'
import { SeoScorePanel } from '@/components/seo/SeoScorePanel'
import { MetaLengthHint } from '@/components/seo/MetaLengthHint'
import { GooglePreviewSnippet } from '@/components/seo/GooglePreviewSnippet'

interface Product {
  id: number
  name: string
  slug?: string
  category: string
  price: number
  original_price?: number
  discount?: number
  description: string
  tagline?: string
  /** API may return string (raw JSON) or parsed object */
  color_variants?: string | Record<string, unknown> | unknown[]
  /** API may return string (raw JSON) or parsed array */
  colors?: string | string[]
  default_color?: string
  range_km?: number
  power_w?: number
  battery_type?: string
  weight_kg?: number
  max_speed_kmh?: number
  charging_time?: string
  storage_liters?: number
  badge?: string
  available: number
  priority: number
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string | null
  focus_keyword?: string | null
  created_at: string
  updated_at: string
}

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

/** Normalize color key that may be stored as JSON-escaped string (e.g. "[\"Trắng\"" or "\"Den\"") to clean name. */
function normalizeColorKey(key: string): string {
  if (!key || typeof key !== 'string') return key
  const t = key.trim()
  if (!t) return key
  try {
    const parsed = JSON.parse(t)
    if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0]).trim()
    if (typeof parsed === 'string') return parsed.trim()
  } catch {
    /* not valid JSON */
  }
  let cleaned = t.replace(/\\"/g, '"').replace(/^["\s\[\]]+/, '').replace(/["\s\[\]]+$/, '').trim()
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.slice(1, -1).replace(/\\"/g, '"')
  return cleaned || t
}

/** Resolve relative image URLs so they load when admin runs on localhost (e.g. /uploads/... -> API_BASE_URL + path). */
function resolveImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url
  const t = url.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/')) return `${API_BASE_URL.replace(/\/$/, '')}${t}`
  return t
}

/** Normalize API value to string[] (handles string[] or array of { url } objects). */
function normalizeToImageUrls(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val
    .map((item): string => {
      if (typeof item === 'string') return resolveImageUrl(item)
      if (typeof item === 'object' && item !== null) {
        if ('url' in item && typeof (item as { url: unknown }).url === 'string') return resolveImageUrl((item as { url: string }).url)
        if ('image' in item && typeof (item as { image: unknown }).image === 'string') return resolveImageUrl((item as { image: string }).image)
      }
      return ''
    })
    .filter(Boolean)
}

function parseColorVariantsFromProduct(product: Product): Record<string, string[]> {
  let parsed: Record<string, string[]> = {}
  try {
    if (product.color_variants != null && product.color_variants !== '') {
      let raw: unknown =
        typeof product.color_variants === 'string'
          ? (JSON.parse(product.color_variants) as unknown)
          : (product.color_variants as unknown)
      // Double-encoded: sometimes API/DB returns string that parses to another JSON string
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw) as unknown
        } catch {
          /* use raw as-is below, will not match array/object */
        }
      }
      // Same as main: object { "Trắng": ["url"], ... } → use directly
      if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
        const obj = raw as Record<string, unknown>
        const keys = Object.keys(obj)
        const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k))
        if (allNumeric && product.colors) {
          let colorNames: string[] = []
          try {
            const c = product.colors
            colorNames = Array.isArray(c) ? (c as string[]) : (JSON.parse(c as string) as string[])
          } catch {
            colorNames = typeof product.colors === 'string' ? (product.colors as string).split(',').map((s) => s.trim()).filter(Boolean) : []
          }
          colorNames = colorNames.map((c) => normalizeColorKey(String(c)))
          keys.forEach((key, idx) => {
            const name = colorNames[idx] || normalizeColorKey(key)
            if (name) {
              const urls = normalizeToImageUrls(obj[key])
              parsed[name] = parsed[name] ? [...parsed[name], ...urls] : urls
            }
          })
        } else {
          // Plain keys (like main): use key as-is, only normalize image values
          keys.forEach((key) => {
            const name = /[\\"\[\]]/.test(String(key)) ? normalizeColorKey(String(key)) : String(key).trim()
            if (!name) return
            const urls = normalizeToImageUrls(obj[key])
            parsed[name] = parsed[name] ? [...parsed[name], ...urls] : urls
          })
        }
      } else if (Array.isArray(raw)) {
        raw.forEach((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'name' in item) {
            const name = normalizeColorKey(String((item as { name: string }).name))
            const imagesRaw = 'images' in item ? (item as { images: unknown }).images : 'image_urls' in item ? (item as { image_urls: unknown }).image_urls : []
            const urls = normalizeToImageUrls(imagesRaw)
            parsed[name] = parsed[name] ? [...parsed[name], ...urls] : urls
          }
        })
      }
    }
  } catch {
    /* ignore */
  }
  if (Object.keys(parsed).length === 0 && product.colors) {
    let colorArray: string[] = Array.isArray(product.colors)
      ? product.colors
      : (() => {
          try {
            const arr = JSON.parse(product.colors as string)
            return Array.isArray(arr) ? arr : (product.colors as string).split(',').map((c) => c.trim()).filter(Boolean)
          } catch {
            return typeof product.colors === 'string' ? (product.colors as string).split(',').map((c) => c.trim()).filter(Boolean) : []
          }
        })()
    colorArray = colorArray.map((c) => normalizeColorKey(String(c)))
    colorArray.forEach((color: string) => { parsed[color] = parsed[color] ?? [] })
  }
  if (Object.keys(parsed).length === 0) parsed = { 'Trắng': [] }
  return parsed
}

function ProductionEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') ?? ''
  const { showToast } = useToast()
  const [categories, setCategories] = React.useState<Category[]>([])
  const [product, setProduct] = React.useState<Product | null>(null)
  const [formData, setFormData] = React.useState({
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
  })
  const [colorVariants, setColorVariants] = React.useState<Record<string, string[]>>({ 'Trắng': [] })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) {
      router.replace('/dashboard/production/')
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const [catRes, prodRes] = await Promise.all([
          apiClient.getProductCategories(),
          apiClient.getProducts({ page: 1, limit: 500 })
        ])
        if (cancelled) return
        if (catRes.success && catRes.data) setCategories(catRes.data as Category[])
        if (!prodRes.success || !prodRes.data) {
          router.replace('/dashboard/production/')
          return
        }
        const list = prodRes.data as Product[]
        const found = list.find((p) => String(p.id) === id)
        if (cancelled) return
        if (!found) {
          router.replace('/dashboard/production/')
          return
        }
        setProduct(found)
        setColorVariants(parseColorVariantsFromProduct(found))
        setFormData({
          name: found.name,
          category: found.category,
          price: found.price,
          original_price: found.original_price || 0,
          discount: found.discount || 0,
          description: found.description,
          tagline: found.tagline || '',
          range_km: found.range_km || 0,
          power_w: found.power_w || 0,
          battery_type: found.battery_type || '',
          weight_kg: found.weight_kg || 0,
          max_speed_kmh: found.max_speed_kmh || 0,
          charging_time: found.charging_time || '',
          storage_liters: found.storage_liters || 0,
          badge: found.badge || '',
          available: found.available,
          priority: found.priority,
          meta_title: found.meta_title ?? '',
          meta_description: found.meta_description ?? '',
          keywords: found.keywords ?? '',
          focus_keyword: found.focus_keyword ?? ''
        })
      } catch {
        if (!cancelled) router.replace('/dashboard/production/')
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
      const response = await apiClient.updateProduct(id, submissionData)
      if (response.success) {
        showToast(toast.success('Cập nhật thành công', 'Sản phẩm đã được cập nhật'))
        router.push('/dashboard/production/')
      } else {
        const errorMsg = response.error || 'Không thể cập nhật sản phẩm'
        setError(errorMsg)
        showToast(toast.error('Lỗi cập nhật', errorMsg))
      }
    } catch (err) {
      console.error('Error updating product:', err)
      setError('Có lỗi xảy ra khi lưu sản phẩm')
      showToast(toast.error('Lỗi hệ thống', 'Có lỗi xảy ra khi lưu sản phẩm'))
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

  if (!id || !product) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/production/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h2>
          <p className="text-gray-600">Cập nhật thông tin sản phẩm</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa sản phẩm</CardTitle>
          <CardDescription>Cập nhật thông tin sản phẩm</CardDescription>
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
                path={product.slug ? `/products/${product.slug}` : `/products/${formData.name.trim() ? formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u00C0-\u024F-]/gi, '').slice(0, 80) : 'san-pham'}`}
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
              <Link href="/dashboard/production/">
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

export default function ProductionEditPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <ProductionEditContent />
    </React.Suspense>
  )
}
