'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Loader2, Building } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <Building className="w-8 h-8 text-white" />
        </div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Huang Shan Global</h1>
          <p className="text-gray-600">Admin Panel Loading...</p>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
      </div>
    </div>
  )
}
