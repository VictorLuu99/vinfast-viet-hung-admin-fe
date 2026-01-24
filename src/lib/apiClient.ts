import { AppDispatch, RootState } from '@/store'
import { selectToken, refreshTokenAsync, forceLogout, updateActivity } from '@/store/authSlice'

/**
 * VinFast VietHung API Client
 * Vietnamese-only automotive dealership management system
 * Connects to Hono.js API running on Cloudflare Workers
 */

// VinFast API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vinfast-viethung-api.xox-labs-server.workers.dev'

// Navigation helper for 401 redirects
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    // Clear any existing tokens
    localStorage.removeItem('admin-token')
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    // Redirect to login page
    window.location.href = '/login'
  }
}

export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  error?: string
}

/**
 * VinFast VietHung API Client with Redux integration
 * Vietnamese-only automotive dealership management
 * Automatically handles token refresh, authentication, and activity tracking
 */
export class ApiClient {
  private baseUrl: string
  private dispatch: AppDispatch | null = null
  private getState: (() => RootState) | null = null
  private retryAttempts = 0
  private maxRetries = 1

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Initialize with Redux store for automatic token management
   */
  public initializeStore(dispatch: AppDispatch, getState: () => RootState) {
    this.dispatch = dispatch
    this.getState = getState
  }

  /**
   * Get authentication headers with current token from Redux store
   */
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null

    // Try to get token from Redux store first
    if (this.getState) {
      token = selectToken(this.getState())
    }

    // Fallback to localStorage for backward compatibility
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('admin-token')
    }

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  /**
   * Enhanced request method with automatic token refresh and retry logic
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      // Update user activity for authenticated requests
      if (this.dispatch && this.getState && selectToken(this.getState())) {
        this.dispatch(updateActivity())
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      const result = await response.json()

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // If no dispatch available (Redux not initialized), redirect immediately
        if (!this.dispatch || !this.getState) {
          console.log('401 Unauthorized - redirecting to login')
          redirectToLogin()
          throw new Error('Authentication expired. Please login again.')
        }
        return await this.handleUnauthorized(endpoint, options)
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      // Reset retry attempts on success
      this.retryAttempts = 0

      // Return the API result directly since it already has the correct structure
      return result
    } catch (error) {
      console.error('API request failed:', error)
      
      // If it's a network error and we have retries left, try again
      if (this.retryAttempts < this.maxRetries && error instanceof TypeError) {
        this.retryAttempts++
        console.log(`Retrying request (${this.retryAttempts}/${this.maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryAttempts))
        return this.request(endpoint, options)
      }

      this.retryAttempts = 0
      throw error
    }
  }

  /**
   * Handle 401 Unauthorized responses with automatic token refresh
   */
  private async handleUnauthorized<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    if (!this.dispatch || !this.getState) {
      throw new Error('Unauthorized: Redux store not initialized')
    }

    try {
      // Attempt to refresh token
      console.log('Token expired, attempting refresh...')
      const refreshResult = this.dispatch(refreshTokenAsync() as never) as { type: string }
      
      if (refreshResult.type === refreshTokenAsync.fulfilled.type) {
        // Token refreshed successfully, retry original request
        console.log('Token refreshed successfully, retrying request')
        return this.request(endpoint, options)
      } else {
        // Refresh failed, force logout and redirect
        console.log('Token refresh failed, forcing logout and redirecting to login')
        this.dispatch(forceLogout())
        redirectToLogin()
        throw new Error('Authentication expired. Please login again.')
      }
    } catch {
      // Force logout and redirect on refresh failure
      this.dispatch(forceLogout())
      redirectToLogin()
      throw new Error('Authentication expired. Please login again.')
    }
  }

  // Auth methods (updated to work with new error handling)
  async login(username: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  }

  async verifyToken() {
    return this.request('/api/auth/verify', {
      method: 'GET'
    })
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST'
    })
  }

  // VinFast News methods (Vietnamese-only)
  async getNews(params?: { page?: number; limit?: number; category?: string; published?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.published !== undefined) searchParams.set('published', params.published.toString())

    return this.request(`/api/news/admin?${searchParams}`)
  }

  async createNews(data: Record<string, unknown>) {
    return this.request('/api/news/admin', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateNews(id: string, data: Record<string, unknown>) {
    return this.request(`/api/news/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteNews(id: string) {
    return this.request(`/api/news/admin/${id}`, {
      method: 'DELETE'
    })
  }

  // VinFast Contacts methods (Vietnamese-only)
  async getContacts(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)

    return this.request(`/api/contacts/admin?${searchParams}`)
  }

  async updateContact(id: string, data: Record<string, unknown>) {
    return this.request(`/api/contacts/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteContact(id: string) {
    return this.request(`/api/contacts/admin/${id}`, {
      method: 'DELETE'
    })
  }

  // VinFast Categories methods (Vietnamese-only)
  async getNewsCategories() {
    return this.request('/api/news/categories')
  }

  async getJobCategories() {
    return this.request('/api/recruitment/categories')
  }

  // VinFast Jobs methods (Vietnamese-only)
  async getJobs(params?: { page?: number; limit?: number; department?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.department) searchParams.set('department', params.department)
    if (params?.status) searchParams.set('status', params.status)

    return this.request(`/api/recruitment/admin/jobs?${searchParams}`)
  }

  async createJob(data: Record<string, unknown>) {
    return this.request('/api/recruitment/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateJob(id: string, data: Record<string, unknown>) {
    return this.request(`/api/recruitment/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteJob(id: string) {
    return this.request(`/api/recruitment/admin/jobs/${id}`, {
      method: 'DELETE'
    })
  }

  // VinFast CV Applications methods (Vietnamese-only)
  async getCVApplications(params?: { page?: number; limit?: number; status?: string; job_id?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.job_id) searchParams.set('job_id', params.job_id)

    return this.request(`/api/recruitment/admin/applications?${searchParams}`)
  }

  async updateCVApplication(id: string, data: Record<string, unknown>) {
    return this.request(`/api/recruitment/admin/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteCVApplication(id: string) {
    return this.request(`/api/recruitment/admin/applications/${id}`, {
      method: 'DELETE'
    })
  }

  // VinFast Products methods (Vietnamese-only)
  async getProducts(params?: { page?: number; limit?: number; category?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.search) searchParams.set('search', params.search)

    return this.request(`/api/products/admin?${searchParams}`)
  }

  async createProduct(data: Record<string, unknown>) {
    return this.request('/api/products/admin', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    return this.request(`/api/products/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/admin/${id}`, {
      method: 'DELETE'
    })
  }

  async getProductCategories() {
    return this.request('/api/products/categories')
  }

  async createProductCategory(data: Record<string, unknown>) {
    return this.request('/api/products/categories/admin', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProductCategory(id: string, data: Record<string, unknown>) {
    return this.request(`/api/products/categories/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProductCategory(id: string) {
    return this.request(`/api/products/categories/admin/${id}`, {
      method: 'DELETE'
    })
  }

  // VinFast Dashboard Stats methods (Vietnamese-only)
  async getStats() {
    return this.request('/api/stats/admin')
  }

  async getHealthStats() {
    return this.request('/health')
  }

  // VinFast Hero Section methods (Vietnamese-only)
  async getHero() {
    return this.request('/api/hero/admin')
  }

  async updateHero(data: Record<string, unknown>) {
    return this.request('/api/hero/admin', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // File upload method
  async uploadFile(file: File): Promise<{ success: boolean; data: unknown }> {
    const formData = new FormData()
    formData.append('file', file)
    
    let token: string | null = null

    // Get token from Redux store
    if (this.getState) {
      token = selectToken(this.getState())
    }

    // Fallback to localStorage
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('admin-token')
    }
    
    try {
      // Update activity
      if (this.dispatch) {
        this.dispatch(updateActivity())
      }

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData
      })

      if (response.status === 401) {
        // If no dispatch available, redirect immediately
        if (!this.dispatch || !this.getState) {
          console.log('401 Unauthorized during file upload - redirecting to login')
          redirectToLogin()
          throw new Error('Authentication expired. Please login again.')
        }
        // Handle unauthorized for file upload
        return await this.handleUnauthorizedFileUpload(file)
      }

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      return result
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }

  // Editor file upload method (for TinyMCE and rich text editors)
  async uploadEditorFile(file: File, filename?: string): Promise<{ success: boolean; data: unknown }> {
    const formData = new FormData()
    formData.append('file', file, filename || file.name)

    let token: string | null = null

    // Get token from Redux store
    if (this.getState) {
      token = selectToken(this.getState())
    }

    // Fallback to localStorage
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('admin-token')
    }

    try {
      // Update activity
      if (this.dispatch) {
        this.dispatch(updateActivity())
      }

      const response = await fetch(`${this.baseUrl}/api/upload/editor`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData
      })

      if (response.status === 401) {
        // If no dispatch available, redirect immediately
        if (!this.dispatch || !this.getState) {
          console.log('401 Unauthorized during editor file upload - redirecting to login')
          redirectToLogin()
          throw new Error('Authentication expired. Please login again.')
        }
        // Handle unauthorized for editor file upload
        return await this.handleUnauthorizedEditorFileUpload(file, filename)
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      return result
    } catch (error) {
      console.error('Editor file upload failed:', error)
      throw error
    }
  }

    // Content preview methods
    async previewContent(data: {
      content_html: string;
      content_type: string;
    }) {
      return this.request('/api/preview/content', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    }

  private async handleUnauthorizedFileUpload(file: File) {
    if (!this.dispatch || !this.getState) {
      throw new Error('Unauthorized: Redux store not initialized')
    }

    try {
      // Attempt to refresh token
      const refreshResult = this.dispatch(refreshTokenAsync() as never) as { type: string };

      if (refreshResult.type === refreshTokenAsync.fulfilled.type) {
        // Token refreshed successfully, retry file upload
        return this.uploadFile(file)
      } else {
        // Refresh failed, force logout and redirect
        this.dispatch(forceLogout())
        redirectToLogin()
        throw new Error('Authentication expired. Please login again.')
      }
    } catch {
      this.dispatch(forceLogout())
      redirectToLogin()
      throw new Error('Authentication expired. Please login again.')
    }
  }

  private async handleUnauthorizedEditorFileUpload(file: File, filename?: string) {
    if (!this.dispatch || !this.getState) {
      throw new Error('Unauthorized: Redux store not initialized')
    }

    try {
      // Attempt to refresh token
      const refreshResult = this.dispatch(refreshTokenAsync() as never) as { type: string }

      if (refreshResult.type === refreshTokenAsync.fulfilled.type) {
        // Token refreshed successfully, retry editor file upload
        return this.uploadEditorFile(file, filename)
      } else {
        // Refresh failed, force logout and redirect
        this.dispatch(forceLogout())
        redirectToLogin()
        throw new Error('Authentication expired. Please login again.')
      }
    } catch {
      this.dispatch(forceLogout())
      redirectToLogin()
      throw new Error('Authentication expired. Please login again.')
    }
  }
}

// Export singleton instance for use throughout the app
export const apiClient = new ApiClient()