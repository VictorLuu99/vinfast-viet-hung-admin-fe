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
  Image,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog'
import { FileUpload } from '@/components/ui/file-upload'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface Banner {
  id: number
  desktop_image_url: string
  mobile_image_url: string
  alt: string
  title?: string
  description?: string
  cta_text?: string
  cta_link?: string
  badge_text: string
  badge_enabled: number
  overlay_enabled: number
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export default function BannersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

  const [banners, setBanners] = React.useState<Banner[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadErrorDesktop, setUploadErrorDesktop] = React.useState<string | null>(null)
  const [uploadErrorMobile, setUploadErrorMobile] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Form state
  const [formData, setFormData] = React.useState({
    desktop_image_url: '',
    mobile_image_url: '',
    alt: 'Banner VinFast',
    title: '',
    description: '',
    cta_text: '',
    cta_link: '',
    badge_text: '🔥 Ưu đãi HOT',
    badge_enabled: 1,
    overlay_enabled: 1,
    is_active: 1,
    sort_order: 0,
  })

  // Fetch banners from API
  const fetchBanners = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getBanners({
        page: 1,
        limit: 100  // Get all banners for admin view
      })

      if (response.success) {
        setBanners(response.data as Banner[] || [])
      } else {
        const errorMsg = 'Không thể tải danh sách banners'
        setError(errorMsg)
        showToast(toast.error('Lỗi tải dữ liệu', errorMsg))
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      const errorMsg = 'Có lỗi xảy ra khi tải banners'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  React.useEffect(() => {
    if (user) {
      fetchBanners()
    }
  }, [user, fetchBanners])

  const resetForm = () => {
    setFormData({
      desktop_image_url: '',
      mobile_image_url: '',
      alt: 'Banner VinFast',
      title: '',
      description: '',
      cta_text: '',
      cta_link: '',
      badge_text: '🔥 Ưu đãi HOT',
      badge_enabled: 1,
      overlay_enabled: 1,
      is_active: 1,
      sort_order: 0,
    })
    setUploadErrorDesktop(null)
    setUploadErrorMobile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      if (!formData.desktop_image_url) {
        const errorMsg = 'Vui lòng chọn hoặc nhập URL hình ảnh desktop'
        setError(errorMsg)
        showToast(toast.error('Lỗi validation', errorMsg))
        setIsSubmitting(false)
        return
      }

      if (!formData.mobile_image_url) {
        const errorMsg = 'Vui lòng chọn hoặc nhập URL hình ảnh mobile'
        setError(errorMsg)
        showToast(toast.error('Lỗi validation', errorMsg))
        setIsSubmitting(false)
        return
      }

      if (editingBanner) {
        // Update existing banner
        const response = await apiClient.updateBanner(editingBanner.id.toString(), formData)

        if (response.success) {
          showToast(toast.success('Cập nhật thành công', 'Banner đã được cập nhật'))
          await fetchBanners()
          setIsDialogOpen(false)
          setEditingBanner(null)
          resetForm()
        } else {
          const errorMsg = response.error || 'Không thể cập nhật banner'
          setError(errorMsg)
          showToast(toast.error('Lỗi cập nhật', errorMsg))
        }
      } else {
        // Create new banner
        const response = await apiClient.createBanner(formData)

        if (response.success) {
          showToast(toast.success('Tạo thành công', 'Banner mới đã được tạo'))
          await fetchBanners()
          setIsDialogOpen(false)
          resetForm()
        } else {
          const errorMsg = response.error || 'Không thể tạo banner'
          setError(errorMsg)
          showToast(toast.error('Lỗi tạo mới', errorMsg))
        }
      }
    } catch (error) {
      console.error('Error submitting banner:', error)
      const errorMsg = 'Có lỗi xảy ra khi lưu banner'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url,
      alt: banner.alt || 'Banner VinFast',
      title: banner.title || '',
      description: banner.description || '',
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      badge_text: banner.badge_text || '🔥 Ưu đãi HOT',
      badge_enabled: banner.badge_enabled,
      overlay_enabled: banner.overlay_enabled,
      is_active: banner.is_active,
      sort_order: banner.sort_order,
    })
    setUploadErrorDesktop(null)
    setUploadErrorMobile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (banner: Banner) => {
    showConfirmation(confirmations.delete(`Banner #${banner.id}`, async () => {
      try {
        setError(null)
        const response = await apiClient.deleteBanner(banner.id.toString())

        if (response.success) {
          showToast(toast.success('Xóa thành công', 'Banner đã được xóa'))
          await fetchBanners()
        } else {
          const errorMsg = response.error || 'Không thể xóa banner'
          setError(errorMsg)
          showToast(toast.error('Lỗi xóa', errorMsg))
        }
      } catch (error) {
        console.error('Error deleting banner:', error)
        const errorMsg = 'Có lỗi xảy ra khi xóa banner'
        setError(errorMsg)
        showToast(toast.error('Lỗi hệ thống', errorMsg))
      }
    }))
  }

  const handleSortOrderChange = async (bannerId: number, newSortOrder: number) => {
    try {
      const response = await apiClient.updateBanner(bannerId.toString(), {
        sort_order: newSortOrder,
      })

      if (response.success) {
        await fetchBanners()
      }
    } catch (error) {
      console.error('Error updating sort order:', error)
      showToast(toast.error('Lỗi', 'Không thể cập nhật thứ tự'))
    }
  }

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = 
      (banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (banner.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      banner.alt.toLowerCase().includes(searchTerm.toLowerCase())
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
      <ConfirmationDialog />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Banners</h2>
          <p className="text-gray-600">Quản lý banner carousel cho trang chủ</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            resetForm()
            setEditingBanner(null)
            setError(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Chỉnh sửa Banner' : 'Tạo Banner mới'}
              </DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Cập nhật thông tin banner' : 'Tạo banner mới cho carousel'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Desktop Image */}
              <div className="space-y-2">
                <Label htmlFor="desktop_image_url">Hình ảnh Desktop *</Label>
                <FileUpload
                  value={formData.desktop_image_url}
                  onChange={(url) => {
                    setFormData({ ...formData, desktop_image_url: url })
                    setUploadErrorDesktop(null)
                  }}
                  onError={(error) => {
                    setUploadErrorDesktop(error)
                    showToast(toast.error('Lỗi upload', error))
                  }}
                  accept="image/*"
                  maxSize={10}
                  placeholder="Chọn hình ảnh desktop để tải lên"
                />
                <Input
                  id="desktop_image_url_manual"
                  type="url"
                  value={formData.desktop_image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, desktop_image_url: e.target.value })
                    setUploadErrorDesktop(null)
                  }}
                  placeholder="Hoặc nhập URL hình ảnh desktop"
                />
                {uploadErrorDesktop && (
                  <div className="text-sm text-red-600">{uploadErrorDesktop}</div>
                )}
              </div>

              {/* Mobile Image */}
              <div className="space-y-2">
                <Label htmlFor="mobile_image_url">Hình ảnh Mobile *</Label>
                <FileUpload
                  value={formData.mobile_image_url}
                  onChange={(url) => {
                    setFormData({ ...formData, mobile_image_url: url })
                    setUploadErrorMobile(null)
                  }}
                  onError={(error) => {
                    setUploadErrorMobile(error)
                    showToast(toast.error('Lỗi upload', error))
                  }}
                  accept="image/*"
                  maxSize={10}
                  placeholder="Chọn hình ảnh mobile để tải lên"
                />
                <Input
                  id="mobile_image_url_manual"
                  type="url"
                  value={formData.mobile_image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, mobile_image_url: e.target.value })
                    setUploadErrorMobile(null)
                  }}
                  placeholder="Hoặc nhập URL hình ảnh mobile"
                />
                {uploadErrorMobile && (
                  <div className="text-sm text-red-600">{uploadErrorMobile}</div>
                )}
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  placeholder="Banner VinFast"
                />
              </div>

              {/* Badge Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="badge_enabled"
                    checked={formData.badge_enabled === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        badge_enabled: e.target.checked ? 1 : 0,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="badge_enabled" className="cursor-pointer">
                    Hiển thị Badge
                  </Label>
                </div>
                {formData.badge_enabled === 1 && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="badge_text">Badge Text</Label>
                    <Input
                      id="badge_text"
                      value={formData.badge_text}
                      onChange={(e) =>
                        setFormData({ ...formData, badge_text: e.target.value })
                      }
                      placeholder="🔥 Ưu đãi HOT"
                    />
                  </div>
                )}
              </div>

              {/* Overlay Content Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overlay_enabled"
                    checked={formData.overlay_enabled === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overlay_enabled: e.target.checked ? 1 : 0,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="overlay_enabled" className="cursor-pointer">
                    Hiển thị Overlay Content
                  </Label>
                </div>
                {formData.overlay_enabled === 1 && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tiêu đề</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Ưu Đãi Đặc Biệt"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Giảm giá lên đến 6% và nhiều ưu đãi hấp dẫn"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta_text">CTA Text</Label>
                      <Input
                        id="cta_text"
                        value={formData.cta_text}
                        onChange={(e) =>
                          setFormData({ ...formData, cta_text: e.target.value })
                        }
                        placeholder="Xem chi tiết"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta_link">CTA Link</Label>
                      <Input
                        id="cta_link"
                        type="url"
                        value={formData.cta_link}
                        onChange={(e) =>
                          setFormData({ ...formData, cta_link: e.target.value })
                        }
                        placeholder="#products hoặc https://example.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.checked ? 1 : 0,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active (hiển thị trên website)
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Thứ tự hiển thị</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Số nhỏ hơn sẽ hiển thị trước
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingBanner ? 'Cập nhật' : 'Tạo mới'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Banners Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">Không có banners nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Banners ({filteredBanners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Alt Text</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Overlay</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                        <img
                          src={banner.desktop_image_url}
                          alt={banner.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{banner.alt}</TableCell>
                    <TableCell className="max-w-xs truncate">{banner.title || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={banner.badge_enabled === 1 ? 'default' : 'secondary'}>
                        {banner.badge_enabled === 1 ? 'Có' : 'Không'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.overlay_enabled === 1 ? 'default' : 'secondary'}>
                        {banner.overlay_enabled === 1 ? 'Có' : 'Không'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSortOrderChange(banner.id, banner.sort_order - 1)}
                          disabled={banner.sort_order === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{banner.sort_order}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSortOrderChange(banner.id, banner.sort_order + 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.is_active === 1 ? 'default' : 'secondary'}>
                        {banner.is_active === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(banner.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(banner)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
