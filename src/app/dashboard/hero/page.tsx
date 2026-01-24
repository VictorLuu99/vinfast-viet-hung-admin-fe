'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Image as ImageIcon, Upload } from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { FileUpload } from '@/components/ui/file-upload'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface HeroSection {
  id?: number
  hero_image_url: string
  hero_image_alt: string
  badge_title: string
  badge_discount: string
  badge_additional: string
  badge_enabled: number
  is_active?: number
}

export default function HeroSectionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState<HeroSection>({
    hero_image_url: '',
    hero_image_alt: 'Xe máy điện VinFast',
    badge_title: 'Ưu đãi đặc biệt',
    badge_discount: 'Giảm 6%',
    badge_additional: '+ Miễn phí trước bạ',
    badge_enabled: 1,
  })

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch hero section data
  const fetchHero = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getHero()

      if (response.success && response.data) {
        const heroData = response.data as HeroSection
        setFormData({
          hero_image_url: heroData.hero_image_url || '',
          hero_image_alt: heroData.hero_image_alt || 'Xe máy điện VinFast',
          badge_title: heroData.badge_title || 'Ưu đãi đặc biệt',
          badge_discount: heroData.badge_discount || 'Giảm 6%',
          badge_additional: heroData.badge_additional || '+ Miễn phí trước bạ',
          badge_enabled: heroData.badge_enabled !== undefined ? heroData.badge_enabled : 1,
        })
      } else {
        const errorMsg = 'Không thể tải thông tin hero section'
        setError(errorMsg)
        showToast(toast.error('Lỗi tải dữ liệu', errorMsg))
      }
    } catch (error) {
      console.error('Error fetching hero section:', error)
      const errorMsg = 'Có lỗi xảy ra khi tải thông tin hero section'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  React.useEffect(() => {
    if (user) {
      fetchHero()
    }
  }, [user, fetchHero])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      setUploadError(null)

      if (!formData.hero_image_url) {
        const errorMsg = 'Vui lòng chọn hoặc nhập URL hình ảnh hero'
        setError(errorMsg)
        showToast(toast.error('Lỗi validation', errorMsg))
        setIsSubmitting(false)
        return
      }

      const response = await apiClient.updateHero({
        hero_image_url: formData.hero_image_url,
        hero_image_alt: formData.hero_image_alt || 'Xe máy điện VinFast',
        badge_title: formData.badge_title || 'Ưu đãi đặc biệt',
        badge_discount: formData.badge_discount || 'Giảm 6%',
        badge_additional: formData.badge_additional || '+ Miễn phí trước bạ',
        badge_enabled: formData.badge_enabled ? 1 : 0,
      })

      if (response.success) {
        showToast(toast.success('Cập nhật thành công', 'Hero section đã được cập nhật'))
        await fetchHero() // Refresh data
      } else {
        const errorMsg = response.error || 'Không thể cập nhật hero section'
        setError(errorMsg)
        showToast(toast.error('Lỗi cập nhật', errorMsg))
      }
    } catch (error) {
      console.error('Error updating hero section:', error)
      const errorMsg = 'Có lỗi xảy ra khi cập nhật hero section'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Hero Section</h2>
        <p className="text-gray-600">Chỉnh sửa hình ảnh hero và thông tin floating badge</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình Hero Section</CardTitle>
          <CardDescription>
            Cập nhật hình ảnh hero và thông tin badge hiển thị trên trang chủ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hero Image Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero_image_url" className="text-base font-semibold">
                  Hình ảnh Hero *
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Upload hình ảnh hoặc nhập URL hình ảnh từ bên ngoài
                </p>
              </div>

              {/* File Upload Component */}
              <FileUpload
                value={formData.hero_image_url}
                onChange={(url) => {
                  setFormData({ ...formData, hero_image_url: url })
                  setUploadError(null)
                }}
                onError={(error) => {
                  setUploadError(error)
                  showToast(toast.error('Lỗi upload', error))
                }}
                accept="image/*"
                maxSize={10}
                placeholder="Chọn hình ảnh hero để tải lên"
              />

              {/* Manual URL Input */}
              <div className="space-y-2">
                <Label htmlFor="hero_image_url_manual">Hoặc nhập URL hình ảnh</Label>
                <Input
                  id="hero_image_url_manual"
                  type="url"
                  value={formData.hero_image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, hero_image_url: e.target.value })
                    setUploadError(null)
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Image Preview */}
              {formData.hero_image_url && (
                <div className="mt-4">
                  <Label>Xem trước hình ảnh</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden max-w-2xl">
                    <img
                      src={formData.hero_image_url}
                      alt={formData.hero_image_alt}
                      className="w-full h-auto object-cover"
                      onError={() => {
                        setUploadError('Không thể tải hình ảnh từ URL này')
                      }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="text-sm text-red-600">{uploadError}</div>
              )}
            </div>

            {/* Image Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="hero_image_alt">Alt Text cho hình ảnh</Label>
              <Input
                id="hero_image_alt"
                value={formData.hero_image_alt}
                onChange={(e) => setFormData({ ...formData, hero_image_alt: e.target.value })}
                placeholder="Xe máy điện VinFast"
              />
              <p className="text-xs text-gray-500">
                Mô tả hình ảnh cho SEO và accessibility
              </p>
            </div>

            {/* Floating Badge Section */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="text-base font-semibold">Floating Badge</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Thông tin badge hiển thị trên hình ảnh hero
                </p>
              </div>

              {/* Badge Enabled Toggle */}
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
                  Hiển thị floating badge
                </Label>
              </div>

              {/* Badge Fields */}
              {formData.badge_enabled === 1 && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="badge_title">Tiêu đề Badge</Label>
                    <Input
                      id="badge_title"
                      value={formData.badge_title}
                      onChange={(e) =>
                        setFormData({ ...formData, badge_title: e.target.value })
                      }
                      placeholder="Ưu đãi đặc biệt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge_discount">Text Discount</Label>
                    <Input
                      id="badge_discount"
                      value={formData.badge_discount}
                      onChange={(e) =>
                        setFormData({ ...formData, badge_discount: e.target.value })
                      }
                      placeholder="Giảm 6%"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge_additional">Text Bổ Sung</Label>
                    <Input
                      id="badge_additional"
                      value={formData.badge_additional}
                      onChange={(e) =>
                        setFormData({ ...formData, badge_additional: e.target.value })
                      }
                      placeholder="+ Miễn phí trước bạ"
                    />
                  </div>

                  {/* Badge Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <Label>Xem trước Badge</Label>
                    <div className="mt-2 inline-block bg-red-500 text-white rounded-2xl p-4 shadow-lg">
                      <p className="text-xs md:text-sm font-semibold mb-1">
                        {formData.badge_title || 'Ưu đãi đặc biệt'}
                      </p>
                      <p className="text-xl md:text-3xl font-bold">
                        {formData.badge_discount || 'Giảm 6%'}
                      </p>
                      <p className="text-xs md:text-sm opacity-90">
                        {formData.badge_additional || '+ Miễn phí trước bạ'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => fetchHero()}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
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
