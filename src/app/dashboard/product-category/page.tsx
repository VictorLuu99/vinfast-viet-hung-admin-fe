'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Save,
  Hash,
} from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog'

interface ProductCategory {
  id: number
  name: string
  slug: string
  display_name: string
  description: string
  sort_order: number
  created_at: string
  updated_at: string
}

export default function VinFastProductCategoryPage() {
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<ProductCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { showToast } = useToast()
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    display_name: '',
    description: '',
    sort_order: 0
  })

  // Fetch categories from API
  const fetchCategories = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getProductCategories()

      if (response.success) {
        setCategories(response.data as ProductCategory[] || [])
      } else {
        const errorMsg = 'Không thể tải danh sách danh mục'
        setError(errorMsg)
        showToast(toast.error('Lỗi tải dữ liệu', errorMsg))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      const errorMsg = 'Có lỗi xảy ra khi tải danh mục'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      if (editingCategory) {
        // Update existing category
        const response = await apiClient.updateProductCategory(editingCategory.id.toString(), formData)

        if (response.success) {
          showToast(toast.success('Cập nhật thành công', 'Danh mục đã được cập nhật'))
          await fetchCategories() // Refresh the list
          setIsDialogOpen(false)
          setEditingCategory(null)
          setFormData({
            name: '',
            display_name: '',
            description: '',
            sort_order: 0
          })
        } else {
          const errorMsg = 'Không thể cập nhật danh mục'
          setError(errorMsg)
          showToast(toast.error('Lỗi cập nhật', errorMsg))
        }
      } else {
        // Create new category
        const response = await apiClient.createProductCategory(formData)

        if (response.success) {
          showToast(toast.success('Tạo thành công', 'Danh mục mới đã được tạo'))
          await fetchCategories() // Refresh the list
          setIsDialogOpen(false)
          setFormData({
            name: '',
            display_name: '',
            description: '',
            sort_order: 0
          })
        } else {
          const errorMsg = 'Không thể tạo danh mục'
          setError(errorMsg)
          showToast(toast.error('Lỗi tạo mới', errorMsg))
        }
      }
    } catch (error) {
      console.error('Error submitting category:', error)
      const errorMsg = 'Có lỗi xảy ra khi lưu danh mục'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      display_name: category.display_name,
      description: category.description,
      sort_order: category.sort_order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (category: ProductCategory) => {
    showConfirmation(confirmations.delete(category.display_name, async () => {
      try {
        setError(null)
        const response = await apiClient.deleteProductCategory(category.id.toString())

        if (response.success) {
          showToast(toast.success('Xóa thành công', 'Danh mục đã được xóa'))
          await fetchCategories() // Refresh the list
        } else {
          const errorMsg = 'Không thể xóa danh mục'
          setError(errorMsg)
          showToast(toast.error('Lỗi xóa', errorMsg))
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        const errorMsg = 'Có lỗi xảy ra khi xóa danh mục'
        setError(errorMsg)
        showToast(toast.error('Lỗi hệ thống', errorMsg))
      }
    }))
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
          <h2 className="text-2xl font-bold text-gray-900">Phân loại xe máy</h2>
          <p className="text-gray-600">xe điện VinFast VietHung</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setFormData({
              name: '',
              display_name: '',
              description: '',
              sort_order: 0
            })
            // Clear form and errors when dialog closes
            setError(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Cập nhật thông tin danh mục sản phẩm' : 'Tạo danh mục sản phẩm mới cho VinFast VietHung'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên danh mục (slug)"
                  required
                />
                <p className="text-xs text-gray-500">Tên danh mục dùng cho URL (ví dụ: xe-may-dien)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Tên hiển thị *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Nhập tên hiển thị"
                  required
                />
                <p className="text-xs text-gray-500">Tên hiển thị cho người dùng (ví dụ: Xe máy điện)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về danh mục..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Thứ tự hiển thị</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500">Số nhỏ hơn sẽ hiển thị trước (0 = đầu tiên)</p>
              </div>

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
                      {editingCategory ? 'Đang cập nhật...' : 'Đang tạo...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategory ? 'Cập nhật' : 'Tạo mới'}
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
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Danh sách danh mục ({filteredCategories.length})
          </CardTitle>
          <CardDescription>
            Quản lý tất cả danh mục sản phẩm xe điện VinFast VietHung
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
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Tên hiển thị</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {category.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{category.display_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs">
                          {category.description ? (
                            category.description.length > 80
                              ? `${category.description.substring(0, 80)}...`
                              : category.description
                          ) : (
                            <span className="text-gray-400 italic">Không có mô tả</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {category.sort_order}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(category.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(category)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCategories.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Tags className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? 'Không tìm thấy danh mục nào phù hợp'
                      : 'Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!'
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