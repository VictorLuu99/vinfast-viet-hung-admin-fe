'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { Car, Loader2, Zap, Shield } from 'lucide-react'

export default function VinFastLoginPage() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await login(username, password)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
          <Car className="h-8 w-8 text-green-600 animate-pulse" />
          <span className="text-lg font-medium text-gray-700">VinFast VietHung</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        {/* VinFast Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Zap className="h-12 w-12 text-blue-600" />
              <Car className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VinFast VietHung</h1>
          <p className="text-gray-600">Xe điện thông minh, tương lai xanh</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-900">Đăng nhập Admin</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Truy cập vào hệ thống quản lý VinFast VietHung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Bảo mật</span>
              </div>
              <p className="text-blue-700 text-xs mt-1">
                Hệ thống chỉ dành cho nhân viên VinFast VietHung có thẩm quyền
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 VinFast VietHung. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            <span>Phiên bản 1.0.0</span>
            <span>•</span>
            <span>Hỗ trợ kỹ thuật: admin@vinfast-viethung.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}