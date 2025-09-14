'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Car,
  FileText,
  MessageSquare,
  Briefcase,
  Users,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Zap
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Bảng điều khiển',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    id: 'news',
    label: 'Quản lý tin tức',
    icon: FileText,
    href: '/dashboard/news'
  },
  {
    id: 'contacts',
    label: 'Liên hệ khách hàng',
    icon: MessageSquare,
    href: '/dashboard/contacts'
  },
  {
    id: 'jobs',
    label: 'Tuyển dụng',
    icon: Briefcase,
    href: '/dashboard/jobs'
  },
  {
    id: 'candidates',
    label: 'Ứng viên',
    icon: Users,
    href: '/dashboard/candidates'
  }
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Prevent hydration mismatch by only showing loading state after component mounts
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
          <Car className="h-8 w-8 text-green-600 animate-pulse" />
          <span className="text-lg font-medium text-gray-700">VinFast VietHung</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* VinFast VietHung Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Zap className="h-6 w-6 text-blue-600" />
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">VinFast VietHung</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-10 w-64"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">VinFast VietHung</p>
              </div>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-16",
          "fixed lg:relative inset-y-0 left-0 z-40 pt-16 lg:pt-0"
        )}>
          <div className="p-4">
            {isSidebarOpen && (
              <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <Car className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">VinFast VietHung</span>
                </div>
                <p className="text-xs text-gray-600">
                  Xe điện thông minh, tương lai xanh
                </p>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start",
                      !isSidebarOpen && "px-2",
                      isActive && "bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-5 w-5" />
                    {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Button>
                )
              })}
            </nav>

            {isSidebarOpen && (
              <div className="mt-8 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900">Hệ thống</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">Hoạt động bình thường</p>
                <div className="text-xs text-gray-500">
                  <div>API: Kết nối</div>
                  <div>Database: Hoạt động</div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 transition-all duration-300",
          !isSidebarOpen && "lg:ml-0"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="h-4 w-4 text-blue-600" />
            <Car className="h-4 w-4 text-green-600" />
            <span>© 2025 VinFast VietHung. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Version 1.0.0</span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Cài đặt
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}