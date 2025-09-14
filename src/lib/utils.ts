import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export from the new API client for backward compatibility
export { API_BASE_URL, apiClient } from './apiClient'

// Format date utility
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format status badge utility  
export const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'active':
    case 'hired':
    case 'replied':
      return 'success'
    case 'draft':
    case 'pending':
    case 'new':
    case 'reviewed':
      return 'warning'
    case 'archived':
    case 'inactive':
    case 'rejected':
    case 'closed':
      return 'destructive'
    case 'interviewed':
      return 'default'
    default:
      return 'secondary'
  }
}

// Service type label mapping
export const getServiceTypeLabel = (serviceType?: string): string => {
  if (!serviceType) return 'General Inquiry'
  
  switch (serviceType) {
    case 'official_unofficial_transport':
      return 'Official and Unofficial Transport'
    case 'ecommerce_shipping':
      return 'E-commerce Shipping'
    case 'import_machinery':
      return 'Import Machinery'
    case 'order_taobao_1688':
      return 'Order Taobao/1688'
    default:
      return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

// Priority level label mapping
export const getPriorityLabel = (priority?: string): string => {
  if (!priority) return 'Normal'
  
  switch (priority) {
    case 'low':
      return 'Low'
    case 'normal':
      return 'Normal'
    case 'high':
      return 'High'
    case 'urgent':
      return 'Urgent'
    default:
      return priority.charAt(0).toUpperCase() + priority.slice(1)
  }
}

// Priority badge variant
export const getPriorityBadgeVariant = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'warning'
    case 'normal':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'default'
  }
}

// VinFast VietHung specific helper functions
export const getDepartmentLabel = (department?: string): string => {
  if (!department) return 'Khác'

  switch (department.toLowerCase()) {
    case 'sales':
    case 'ban_hang':
      return 'Bán hàng'
    case 'service':
    case 'dich_vu':
      return 'Dịch vụ khách hàng'
    case 'technical':
    case 'ky_thuat':
      return 'Kỹ thuật'
    case 'operations':
    case 'van_hanh':
      return 'Vận hành'
    case 'management':
    case 'quan_ly':
      return 'Quản lý'
    default:
      return department
  }
}

export const getEmploymentTypeLabel = (type?: string): string => {
  switch (type) {
    case 'full_time':
      return 'Toàn thời gian'
    case 'part_time':
      return 'Bán thời gian'
    case 'contract':
      return 'Hợp đồng'
    case 'internship':
      return 'Thực tập'
    default:
      return 'Toàn thời gian'
  }
}

// Contact display name helper
export const getContactDisplayName = (contact: { full_name?: string; name?: string }): string => {
  return contact.full_name || contact.name || 'Unknown Contact'
}