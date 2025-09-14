'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  MessageSquare,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  Car,
  Zap
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  news: { total: number; published: number; draft: number }
  contacts: { total: number; new: number; replied: number }
  jobs: { total: number; active: number }
  candidates: { total: number; pending: number; hired: number }
}

export default function VinFastDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [isStatsLoading, setIsStatsLoading] = React.useState(true)

  const { user, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setIsStatsLoading(true)
        // Mock data for now - will connect to actual API later
        setStats({
          news: { total: 12, published: 8, draft: 4 },
          contacts: { total: 45, new: 12, replied: 33 },
          jobs: { total: 8, active: 5 },
          candidates: { total: 23, pending: 8, hired: 3 }
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setStats({
          news: { total: 0, published: 0, draft: 0 },
          contacts: { total: 0, new: 0, replied: 0 },
          jobs: { total: 0, active: 0 },
          candidates: { total: 0, pending: 0, hired: 0 }
        })
      } finally {
        setIsStatsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (isLoading || isStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <Car className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h2>
            <p className="text-gray-600">Chào mừng đến với VinFast VietHung Admin</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with VinFast Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <Car className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h2>
          <p className="text-gray-600">Chào mừng đến với VinFast VietHung Admin</p>
        </div>
      </div>

      {/* Welcome Message */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">VinFast VietHung</h3>
              <p className="text-gray-600">
                Đại lý chính thức VinFast - Xe điện thông minh cho tương lai xanh
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* News Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tin tức</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.news.total || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                {stats?.news.published || 0} Đã xuất bản
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats?.news.draft || 0} Bản nháp
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Quản lý tin tức và thông báo
            </p>
          </CardContent>
        </Card>

        {/* Contacts Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liên hệ</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.contacts.total || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {stats?.contacts.new || 0} Mới
              </Badge>
              <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                {stats?.contacts.replied || 0} Đã phản hồi
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Yêu cầu từ khách hàng
            </p>
          </CardContent>
        </Card>

        {/* Jobs Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tuyển dụng</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                {stats?.jobs.active || 0} Đang tuyển
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Vị trí tuyển dụng
            </p>
          </CardContent>
        </Card>

        {/* Candidates Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ứng viên</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.candidates.total || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats?.candidates.pending || 0} Chờ xử lý
              </Badge>
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                {stats?.candidates.hired || 0} Đã tuyển
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Hồ sơ ứng tuyển
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hệ thống</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Tốt</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                API: Hoạt động
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Trạng thái hệ thống
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thao tác nhanh</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard/news')}
                className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded-md flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Tạo tin tức mới
              </button>
              <button
                onClick={() => router.push('/dashboard/jobs')}
                className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded-md flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Đăng tin tuyển dụng
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>
            Các thay đổi và cập nhật mới nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Đã xuất bản tin tức: &quot;VinFast VF 8 ra mắt tại VietHung&quot;</span>
              <span className="text-gray-400 ml-auto">2 giờ trước</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Nhận được 3 liên hệ mới từ khách hàng</span>
              <span className="text-gray-400 ml-auto">4 giờ trước</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-600">Cập nhật vị trí tuyển dụng: &quot;Nhân viên tư vấn bán hàng&quot;</span>
              <span className="text-gray-400 ml-auto">1 ngày trước</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Có 2 ứng viên mới nộp hồ sơ</span>
              <span className="text-gray-400 ml-auto">2 ngày trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}