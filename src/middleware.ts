import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Enhanced middleware with better token handling and validation
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes without authentication
  const publicRoutes = ['/login']
  const apiRoutes = ['/api/auth/login', '/api/auth/verify'] // Public API routes
  const staticRoutes = ['/_next/', '/favicon.ico', '/public/']

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname)
  const isPublicApiRoute = apiRoutes.some(route => pathname.startsWith(route))
  const isStaticRoute = staticRoutes.some(route => pathname.startsWith(route))

  // Allow access to public routes
  if (isPublicRoute || isPublicApiRoute || isStaticRoute) {
    return NextResponse.next()
  }

  // For protected routes, check for auth token
  const token = request.cookies.get('admin-token')?.value
  
  // Enhanced token validation
  if (!token || token.trim() === '') {
    // Clear any invalid cookies
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('admin-token', '', {
      expires: new Date(0),
      path: '/',
    })
    return response
  }

  // Basic token format validation (JWT should have 3 parts)
  const tokenParts = token.split('.')
  if (tokenParts.length !== 3) {
    console.warn('Invalid token format detected, redirecting to login')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('admin-token', '', {
      expires: new Date(0),
      path: '/',
    })
    return response
  }

  // Check if token is expired (basic check without verification)
  try {
    const payload = JSON.parse(atob(tokenParts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (payload.exp && payload.exp < currentTime) {
      console.warn('Expired token detected, redirecting to login')
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('admin-token', '', {
        expires: new Date(0),
        path: '/',
      })
      return response
    }
  } catch (error) {
    console.warn('Error parsing token payload:', error)
    // Continue with request - let the API validate the token
  }

  // If accessing root, redirect to dashboard
  if (pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Add security headers for authenticated routes
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}