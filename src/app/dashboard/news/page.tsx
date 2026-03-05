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
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Tag,
} from 'lucide-react'
import { apiClient } from '@/lib/utils'
import { useToast, toast } from '@/components/ui/toast'
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog'

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

export default function VinFastNewsPage() {
  const [articles, setArticles] = React.useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const { showToast } = useToast()
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

  const fetchArticles = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getNews({
        page: 1,
        limit: 100
      })

      if (response.success) {
        setArticles(response.data as NewsArticle[] || [])
      } else {
        const errorMsg = 'Không thể tải danh sách tin tức'
        setError(errorMsg)
        showToast(toast.error('Lỗi tải dữ liệu', errorMsg))
      }
    } catch (err) {
      console.error('Error fetching news:', err)
      const errorMsg = 'Có lỗi xảy ra khi tải tin tức'
      setError(errorMsg)
      showToast(toast.error('Lỗi hệ thống', errorMsg))
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  React.useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleDelete = (article: NewsArticle) => {
    showConfirmation(confirmations.delete(article.title, async () => {
      try {
        setError(null)
        const response = await apiClient.deleteNews(article.id.toString())

        if (response.success) {
          showToast(toast.success('Xóa thành công', 'Tin tức đã được xóa'))
          await fetchArticles()
        } else {
          const errorMsg = 'Không thể xóa tin tức'
          setError(errorMsg)
          showToast(toast.error('Lỗi xóa', errorMsg))
        }
      } catch (err) {
        console.error('Error deleting news:', err)
        const errorMsg = 'Có lỗi xảy ra khi xóa tin tức'
        setError(errorMsg)
        showToast(toast.error('Lỗi hệ thống', errorMsg))
      }
    }))
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (category: string) => {
    return vietnameseCategories.find(cat => cat.value === category)?.label || category
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h2>
          <p className="text-gray-600">Quản lý tin tức và thông báo của VinFast VietHung</p>
        </div>
        <Link href="/dashboard/news/new">
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Tạo tin tức
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
                  placeholder="Tìm kiếm tin tức..."
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
                  {vietnameseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
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
            <FileText className="h-5 w-5" />
            Danh sách tin tức ({filteredArticles.length})
          </CardTitle>
          <CardDescription>
            Quản lý tất cả bài viết tin tức của VinFast VietHung
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
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{article.title}</div>
                          {article.excerpt && (
                            <div className="text-sm text-gray-500 mt-1">
                              {article.excerpt.length > 60
                                ? `${article.excerpt.substring(0, 60)}...`
                                : article.excerpt
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {getCategoryLabel(article.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={article.published ? 'default' : 'secondary'}
                          className={article.published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }
                        >
                          {article.published ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/news/edit?id=${article.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(article)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredArticles.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'Không tìm thấy tin tức nào phù hợp'
                      : 'Chưa có tin tức nào. Hãy tạo tin tức đầu tiên!'
                    }
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
