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

// Contact Types
export interface Contact {
  id: string
  name?: string           // Legacy field for backward compatibility
  full_name?: string      // New primary name field
  email?: string          // Now optional
  phone?: string          // New field
  company?: string        // New field
  subject?: string        // Now optional (auto-generated from service_type)
  message?: string        // Now optional
  service_type?: string   // New field
  priority?: string       // New field
  language?: string       // New field
  status: 'new' | 'read' | 'replied' | 'closed'
  created_at: string
  updated_at: string
}

// Job Types
export interface Job {
  id: string
  title_en?: string
  title_cn?: string  
  title_vn?: string
  description_en?: string
  description_cn?: string
  description_vn?: string
  requirements_en?: string
  requirements_cn?: string
  requirements_vn?: string
  benefits_en?: string
  benefits_cn?: string
  benefits_vn?: string
  location: string
  salary?: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  status: 'active' | 'inactive' | 'closed'
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
  language: string
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
  language: string
}

// News Article Types
export interface NewsItem {
  id: string
  slug?: string
  title_en?: string
  title_cn?: string
  title_vn?: string
  content_en?: string
  content_cn?: string
  content_vn?: string
  content_html_en?: string
  content_html_cn?: string
  content_html_vn?: string
  content_type?: 'plain' | 'rich'
  excerpt?: string
  featured_image?: string
  category: string
  published: number
  featured?: number
  word_count?: number
  reading_time?: number
  images_metadata?: string
  images?: ContentImage[]
  revision_number?: number
  created_at: string
  updated_at: string
}

export interface NewsResponse {
  data: NewsItem[]
  pagination: PaginationData
}

// Knowledge Post Types
export interface KnowledgePost {
  id: string
  slug?: string
  title_en?: string
  title_cn?: string
  title_vn?: string
  content_en?: string
  content_cn?: string
  content_vn?: string
  content_html_en?: string
  content_html_cn?: string
  content_html_vn?: string
  content_type?: 'plain' | 'rich'
  excerpt?: string
  featured_image?: string
  category: string
  status: 'active' | 'inactive' | 'draft'
  featured?: number
  display_order?: number
  word_count?: number
  reading_time?: number
  images_metadata?: string
  images?: ContentImage[]
  revision_number?: number
  created_at: string
  updated_at: string
}

export interface KnowledgePostsResponse {
  data: KnowledgePost[]
  pagination: PaginationData
}