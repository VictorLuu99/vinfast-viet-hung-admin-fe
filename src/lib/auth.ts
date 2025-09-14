// Legacy auth.ts - Compatibility layer for existing code
// This file maintains backward compatibility while using the new Redux-based auth system

export interface User {
  id: string
  username: string
  email?: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Re-export types and functions from the new Redux-based system
export type { User as ReduxUser, AuthState as ReduxAuthState } from '@/store/authSlice'
export { useAuth } from '@/hooks/useAuth'

// Deprecated: AuthManager is no longer used
// Use the useAuth hook instead for all authentication operations
export class AuthManager {
  static getInstance() {
    console.warn('AuthManager is deprecated. Use the useAuth hook instead.')
    throw new Error('AuthManager is deprecated. Use the useAuth hook with Redux instead.')
  }
}

// Deprecated: Direct instance is no longer available
// Use the useAuth hook instead
export const authManager = {
  getInstance: () => {
    console.warn('authManager is deprecated. Use the useAuth hook instead.')
    throw new Error('authManager is deprecated. Use the useAuth hook with Redux instead.')
  }
}

/**
 * @deprecated Use the useAuth hook instead
 * This is kept for backward compatibility only
 */
export function useAuthLegacy() {
  console.warn('useAuthLegacy is deprecated. Use the useAuth hook instead.')
  throw new Error('Use the useAuth hook instead of useAuthLegacy')
}