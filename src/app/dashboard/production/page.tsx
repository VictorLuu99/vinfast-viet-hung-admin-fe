'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Car,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Save,
  DollarSign,
  Battery,
  Zap,
} from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog'
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
  color_variants?: string
  colors?: string
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

export default function VinFastProductionPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [, setIsCategoriesLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [colorVariants, setColorVariants] = React.useState<Record<string, string[]>>({ 'Trắng': [] })
  const [focusKeyword, setFocusKeyword] = React.useState('')
  const { showToast } = useToast()
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    category: 'xe-may-dien',
    price: 0,
    original_price: 0,
    discount: 0,
    description: '',
    tagline: '',
    color_variants: '',
    colors: '',
    default_color: '',
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
    keywords: ''
  })

  // Fetch categories from API
  const fetchCategories = React.useCallback(async () => {
    try {
      setIsCategoriesLoading(true)
      const response = await apiClient.getProductCategories()

      if (response.success) {
        setCategories(response.data as Category[] || [])
      } else {
        console.error('Error fetching categories:', response.error)
        // Fallback to default categories if API fails
        setCategories([
       
        ])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to default categories if API fails
      setCategories([
       
      ])
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [])

  // Fetch products from API
  const fetchProducts = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getProducts({
        page: 1,
        limit: 100  // Get all products for admin view
      })

      if (response.success) {
        const loadedProducts = response.data as Product[] || []


        setProducts(loadedProducts)
      } else {
        const errorMsg = 'Không thể tải danh sách sản phẩm'
        setError(errorMsg)
        showToast(toast.error('Lỗi tải dữ liệu', errorMsg))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      const errorMsg = 'Có lỗi xảy ra khi tải sản phẩm'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  React.useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])


  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'xe-may-dien',
      price: 0,
      original_price: 0,
      discount: 0,
      description: '',
      tagline: '',
      color_variants: '',
      colors: '',
      default_color: '',
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
      keywords: ''
    })
    setColorVariants({ 'Trắng': [] })
    setFocusKeyword('')
    setEditingProduct(null)
  }

  // Helper function to validate and normalize colorVariants
  const validateAndNormalizeColorVariants = (data: unknown): Record<string, string[]> => {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed
        }
      } catch {
        // Invalid JSON, return default
      }
    }
    
    if (Array.isArray(data)) {
      const converted: Record<string, string[]> = {}
      data.forEach((item, index) => {
        if (typeof item === 'object' && item !== null && 'name' in item && 'images' in item) {
          converted[item.name] = Array.isArray(item.images) ? item.images : []
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
    
    // Fallback to default
    return { 'Trắng': [] }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      
      const colorVariantsTMP = validateAndNormalizeColorVariants(colorVariants)
      // Debug: Log current colorVariants state
      // Validation: Ensure we have at least one color with images
      const hasValidColors = Object.keys(colorVariantsTMP).length > 0

      if (!hasValidColors) {
        setError('Vui lòng thêm ít nhất một màu sắc')
        setIsSubmitting(false)
        return
      }

      // Prepare submission data with properly formatted color variants
      const colorVariantsJSON = JSON.stringify(colorVariantsTMP)
      const colorsArray = Object.keys(colorVariantsTMP)
      const colorsJSON = JSON.stringify(colorsArray)
      const defaultColor = colorsArray[0] || ''

      // Create submission data - ensuring color data is not overridden
      const { ...cleanFormData } = formData

      const submissionData = {
        ...cleanFormData,
        color_variants: colorVariantsJSON, // This should contain the gallery data
        colors: colorsJSON,
        default_color: defaultColor
      }


      if (editingProduct) {
        // Update existing product
        const response = await apiClient.updateProduct(editingProduct.id.toString(), submissionData)

        if (response.success) {
          showToast(toast.success('Cập nhật thành công', 'Sản phẩm đã được cập nhật'))
          await fetchProducts() // Refresh the list
          setIsDialogOpen(false)
          resetForm()
        } else {
          console.error('❌ Update failed:', response)
          const errorMsg = response.error || 'Không thể cập nhật sản phẩm'
          setError(errorMsg)
          showToast(toast.error('Lỗi cập nhật', errorMsg))
        }
      } else {
        // Create new product
        const response = await apiClient.createProduct(submissionData)
        if (response.success) {
          showToast(toast.success('Tạo thành công', 'Sản phẩm mới đã được tạo'))
          await fetchProducts() // Refresh the list
          setIsDialogOpen(false)
          resetForm()
        } else {
          console.error('❌ Create failed:', response)
          const errorMsg = response.error || 'Không thể tạo sản phẩm'
          setError(errorMsg)
          showToast(toast.error('Lỗi tạo mới', errorMsg))
        }
      }
    } catch (error) {
      console.error('Error submitting product:', error)
      const errorMsg = 'Có lỗi xảy ra khi lưu sản phẩm'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    // Parse color variants from JSON string
    let parsedColorVariants: Record<string, string[]> = {}
    try {
      if (product.color_variants) {
        parsedColorVariants = JSON.parse(product.color_variants)
      }
    } catch (error) {
      console.error('❌ Error parsing color_variants:', error)
    }

    // If no color variants but has colors, create basic structure
    if (Object.keys(parsedColorVariants).length === 0 && product.colors) {
      try {
        const colorArray = JSON.parse(product.colors)
        if (Array.isArray(colorArray)) {
          colorArray.forEach(color => {
            parsedColorVariants[color] = []
          })
        }
      } catch {
        // Fallback: treat as comma-separated string
        const colorArray = product.colors.split(',').map(c => c.trim()).filter(c => c)
        colorArray.forEach(color => {
          parsedColorVariants[color] = []
        })
      }
    }

    // Ensure at least one color exists
    if (Object.keys(parsedColorVariants).length === 0) {
      parsedColorVariants = { 'Trắng': [] }
    }


    setColorVariants(parsedColorVariants)

    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.original_price || 0,
      discount: product.discount || 0,
      description: product.description,
      tagline: product.tagline || '',
      color_variants: product.color_variants || '',
      colors: product.colors || '',
      default_color: product.default_color || '',
      range_km: product.range_km || 0,
      power_w: product.power_w || 0,
      battery_type: product.battery_type || '',
      weight_kg: product.weight_kg || 0,
      max_speed_kmh: product.max_speed_kmh || 0,
      charging_time: product.charging_time || '',
      storage_liters: product.storage_liters || 0,
      badge: product.badge || '',
      available: product.available,
      priority: product.priority,
      meta_title: product.meta_title ?? '',
      meta_description: product.meta_description ?? '',
      keywords: product.keywords ?? ''
    })

    setIsDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    showConfirmation(confirmations.delete(product.name, async () => {
      try {
        setError(null)
        const response = await apiClient.deleteProduct(product.id.toString())

        if (response.success) {
          showToast(toast.success('Xóa thành công', 'Sản phẩm đã được xóa'))
          await fetchProducts() // Refresh the list
        } else {
          const errorMsg = 'Không thể xóa sản phẩm'
          setError(errorMsg)
          showToast(toast.error('Lỗi xóa', errorMsg))
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        const errorMsg = 'Có lỗi xảy ra khi xóa sản phẩm'
        setError(errorMsg)
        showToast(toast.error('Lỗi hệ thống', errorMsg))
      }
    }))
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (category: string) => {
    return categories.find((cat: Category) => cat.slug === category)?.name || category
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý xe máy</h2>
          <p className="text-gray-600">Quản lý sản phẩm xe điện VinFast VietHung</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm()
          } else if (!editingProduct) {
            // Initialize with default color for new products
            setColorVariants({ 'Trắng': [] })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới cho VinFast VietHung'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
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
                    onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Giảm giá (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Slogan</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Slogan sản phẩm"
                />
              </div>

              <div className="space-y-2">
                <ReactQuillEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
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
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="VD: VinFast Klara | Xe máy điện chính hãng - VinFast Việt Hùng"
                  />
                  <MetaLengthHint value={formData.meta_title} type="title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Mô tả SEO</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="VinFast Klara, xe máy điện, VinFast Việt Hùng, xe máy điện học sinh"
                  />
                </div>
                <GooglePreviewSnippet
                  title={formData.meta_title || formData.name}
                  description={formData.meta_description || formData.tagline}
                  path={editingProduct?.slug ? `/products/${editingProduct.slug}` : `/products/${formData.name.trim() ? formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u00C0-\u024F-]/gi, '').slice(0, 80) : 'san-pham'}`}
                />
              </div>

              {/* Color Variants and Image Gallery */}
              <div className="space-y-4">
                <ImageGallery
                  value={typeof colorVariants === 'string' ? JSON.parse(colorVariants) : colorVariants}
                  onChange={setColorVariants}
                  onError={(error) => {
                    setError(error)
                    showToast(toast.error('Lỗi tải ảnh', error))
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
                    onChange={(e) => setFormData({ ...formData, range_km: parseInt(e.target.value) || 0 })}
                    placeholder="80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="power_w">Công suất (W)</Label>
                  <Input
                    id="power_w"
                    type="number"
                    value={formData.power_w}
                    onChange={(e) => setFormData({ ...formData, power_w: parseInt(e.target.value) || 0 })}
                    placeholder="1200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_speed_kmh">Tốc độ tối đa (km/h)</Label>
                  <Input
                    id="max_speed_kmh"
                    type="number"
                    value={formData.max_speed_kmh}
                    onChange={(e) => setFormData({ ...formData, max_speed_kmh: parseInt(e.target.value) || 0 })}
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
                    onChange={(e) => setFormData({ ...formData, weight_kg: parseInt(e.target.value) || 0 })}
                    placeholder="80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="charging_time">Thời gian sạc</Label>
                  <Input
                    id="charging_time"
                    value={formData.charging_time}
                    onChange={(e) => setFormData({ ...formData, charging_time: e.target.value })}
                    placeholder="4-6 giờ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage_liters">Cốp xe (lít)</Label>
                  <Input
                    id="storage_liters"
                    type="number"
                    value={formData.storage_liters}
                    onChange={(e) => setFormData({ ...formData, storage_liters: parseInt(e.target.value) || 0 })}
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
                    onChange={(e) => setFormData({ ...formData, battery_type: e.target.value })}
                    placeholder="Lithium-ion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge">Nhãn đặc biệt</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Mới, Phổ biến, Bán chạy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="available">Trạng thái</Label>
                  <Select value={formData.available.toString()} onValueChange={(value) => setFormData({ ...formData, available: parseInt(value) })}>
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
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
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
                focusKeyword={focusKeyword}
                onFocusKeywordChange={setFocusKeyword}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingProduct ? 'Đang cập nhật...' : 'Đang tạo...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Danh sách sản phẩm ({filteredProducts.length})
          </CardTitle>
          <CardDescription>
            Quản lý tất cả sản phẩm xe điện VinFast VietHung
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead>Thông số</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.tagline && (
                            <div className="text-sm text-gray-500 mt-1">{product.tagline}</div>
                          )}
                          {product.badge && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="font-medium">{formatPrice(product.price)}</span>
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {product.range_km && (
                            <div className="flex items-center gap-1">
                              <Battery className="h-3 w-3 text-blue-600" />
                              <span>{product.range_km}km</span>
                            </div>
                          )}
                          {product.power_w && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-yellow-600" />
                              <span>{product.power_w}W</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.available ? 'default' : 'secondary'}
                          className={product.available
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }
                        >
                          {product.available ? 'Khả dụng' : 'Không khả dụng'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(product.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'Không tìm thấy sản phẩm nào phù hợp'
                      : 'Chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên!'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beautiful Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  )
}