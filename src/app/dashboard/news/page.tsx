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
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Image,
  Save,
  X
} from 'lucide-react'

interface NewsArticle {
  id: number
  title: string
  content: string
  excerpt?: string
  featured_image?: string
  category: string
  published: number
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
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingArticle, setEditingArticle] = React.useState<NewsArticle | null>(null)

  // Form state
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: 'tin-cong-ty',
    published: 0
  })

  // Mock data - in real app would fetch from API
  React.useEffect(() => {
    const mockArticles: NewsArticle[] = [
      {
        id: 1,
        title: 'Chào mừng đến với VinFast VietHung',
        content: 'VinFast VietHung tự hào là đại lý chính thức của VinFast tại khu vực...',
        excerpt: 'Giới thiệu về VinFast VietHung - đại lý chính thức VinFast',
        category: 'tin-cong-ty',
        published: 1,
        created_at: '2025-01-14T08:00:00Z',
        updated_at: '2025-01-14T08:00:00Z'
      },
      {
        id: 2,
        title: 'Ra mắt VinFast VF 8 - SUV điện thông minh',
        content: 'VinFast VF 8 là mẫu SUV điện 5 chỗ với thiết kế hiện đại...',
        excerpt: 'VinFast VF 8 - Công nghệ tiên tiến, trải nghiệm vượt trội',
        category: 'san-pham-dich-vu',
        published: 1,
        created_at: '2025-01-14T09:00:00Z',
        updated_at: '2025-01-14T09:00:00Z'
      },
      {
        id: 3,
        title: 'Chương trình khuyến mại tháng 1/2025',
        content: 'VinFast VietHung triển khai chương trình khuyến mại hấp dẫn...',
        excerpt: 'Ưu đãi đặc biệt cho khách hàng VinFast trong tháng 1',
        category: 'khuyen-mai',
        published: 0,
        created_at: '2025-01-14T10:00:00Z',
        updated_at: '2025-01-14T10:00:00Z'
      }
    ]

    setTimeout(() => {
      setArticles(mockArticles)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // In real app, would call API
    const newArticle: NewsArticle = {
      id: Date.now(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (editingArticle) {
      setArticles(articles.map(article =>
        article.id === editingArticle.id ? { ...newArticle, id: editingArticle.id } : article
      ))
    } else {
      setArticles([newArticle, ...articles])
    }

    setIsDialogOpen(false)
    setEditingArticle(null)
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image: '',
      category: 'tin-cong-ty',
      published: 0
    })
  }

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      featured_image: article.featured_image || '',
      category: article.category,
      published: article.published
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      setArticles(articles.filter(article => article.id !== id))
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h2>
          <p className="text-gray-600">Quản lý tin tức và thông báo của VinFast VietHung</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo tin tức
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Chỉnh sửa tin tức' : 'Tạo tin tức mới'}
              </DialogTitle>
              <DialogDescription>
                {editingArticle ? 'Cập nhật thông tin bài viết' : 'Tạo bài viết mới cho VinFast VietHung'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                  <Select value={formData.published.toString()} onValueChange={(value) => setFormData({ ...formData, published: parseInt(value) })}>
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
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Mô tả ngắn gọn về bài viết"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image">Ảnh đại diện (URL)</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung bài viết..."
                  rows={8}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {editingArticle ? 'Cập nhật' : 'Tạo mới'}
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

      {/* Articles Table */}
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
                          <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(article.id)}>
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
    </div>
  )
}