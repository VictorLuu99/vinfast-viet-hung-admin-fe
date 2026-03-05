'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Car,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Tag,
  DollarSign,
  Battery,
  Zap,
} from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog'

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
  const { showToast } = useToast()
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

  const fetchCategories = React.useCallback(async () => {
    try {
      setIsCategoriesLoading(true)
      const response = await apiClient.getProductCategories()
      if (response.success) {
        setCategories((response.data as Category[]) || [])
      }
    } catch {
      setCategories([])
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [])

  const fetchProducts = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getProducts({ page: 1, limit: 100 })
      if (response.success) {
        setProducts((response.data as Product[]) || [])
      } else {
        const errorMsg = 'Không thể tải danh sách sản phẩm'
        setError(errorMsg)
        showToast(toast.error('Lỗi tải dữ liệu', errorMsg))
      }
    } catch (err) {
      console.error('Error fetching products:', err)
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

  const handleDelete = (product: Product) => {
    showConfirmation(confirmations.delete(product.name, async () => {
      try {
        setError(null)
        const response = await apiClient.deleteProduct(product.id.toString())
        if (response.success) {
          showToast(toast.success('Xóa thành công', 'Sản phẩm đã được xóa'))
          await fetchProducts()
        } else {
          const errorMsg = response.error || 'Không thể xóa sản phẩm'
          setError(errorMsg)
          showToast(toast.error('Lỗi xóa', errorMsg))
        }
      } catch (err) {
        console.error('Error deleting product:', err)
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
    return categories.find((cat: Category) => cat.slug === category)?.display_name || category
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý xe máy</h2>
          <p className="text-gray-600">Quản lý sản phẩm xe điện VinFast VietHung</p>
        </div>
        <Link href="/dashboard/production/new">
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Tạo sản phẩm
          </Button>
        </Link>
      </div>

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
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-800">{error}</p>
                <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
                          {product.tagline && <div className="text-sm text-gray-500 mt-1">{product.tagline}</div>}
                          {product.badge && (
                            <Badge variant="secondary" className="text-xs mt-1">{product.badge}</Badge>
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
                        {product.original_price != null && product.original_price > product.price && (
                          <div className="text-xs text-gray-500 line-through">{formatPrice(product.original_price)}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {product.range_km != null && product.range_km > 0 && (
                            <div className="flex items-center gap-1">
                              <Battery className="h-3 w-3 text-blue-600" />
                              <span>{product.range_km}km</span>
                            </div>
                          )}
                          {product.power_w != null && product.power_w > 0 && (
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
                          className={product.available ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}
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
                          <Link href={`/dashboard/production/edit?id=${product.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
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
                      : 'Chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog />
    </div>
  )
}
