// API Response Types
export interface PaginationData {
  page: number
  pages?: number
  totalPages?: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  pagination?: PaginationData
  message?: string
  error?: string
}

// CV Application Types
export interface CVApplication {
  id: string
  name: string
  email: string
  position: string
  phone?: string
  cv_url?: string
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted'
  created_at: string
  updated_at: string
}

export interface CVApplicationsResponse {
  data: CVApplication[]
  pagination: PaginationData
}

// Contact Types (VinFast Vietnamese-only)
export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  created_at: string
  updated_at?: string
}

// Job Types (VinFast Vietnamese-only)
export interface Job {
  id: number
  title: string
  description: string
  requirements?: string
  benefits?: string
  location: string
  department: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  status: 'active' | 'closed' | 'draft'
  priority: number
  application_deadline?: string
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface JobsResponse {
  data: Job[]
  pagination: PaginationData
}

// Content Analytics Types
export interface ContentAnalytics {
  wordCount: number
  readingTime: number
  imageCount: number
  characterCount: number
}

export interface ContentImage {
  index: number
  src: string
  alt: string
  title: string
  tag: string
}

export interface ContentValidation {
  valid: boolean
  warnings: string[]
  errors: string[]
}

export interface ContentPreview {
  sanitized_html: string
  word_count: number
  reading_time: number
  images: ContentImage[]
  validation: ContentValidation
  original_length: number
  sanitized_length: number
  images_count: number
  content_type: string
}

// News Article Types (VinFast Vietnamese-only)
export interface NewsItem {
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

export interface NewsResponse {
  data: NewsItem[]
  pagination: PaginationData
}

