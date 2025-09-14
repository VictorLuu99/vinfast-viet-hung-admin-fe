import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo } from 'react'
import { AppDispatch } from '@/store'
import {
  selectIsAuthenticated,
  selectUser,
  selectToken,
  selectIsLoading,
  selectError,
  selectTokenExpiry,
  selectIsTokenExpiring,
  selectShouldRefreshToken,
  loginAsync,
  logoutAsync,
  refreshTokenAsync,
  verifyTokenAsync,
  clearError,
  updateActivity,
  User,
} from '@/store/authSlice'
import { ActivityTracker } from '@/store/middleware/authMiddleware'

// Activity tracker instance
let activityTracker: ActivityTracker | null = null

export interface UseAuthReturn {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokenExpiry: number | null
  
  // Computed properties
  isTokenExpiring: boolean
  shouldRefreshToken: boolean
  
  // Actions
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  verifyToken: () => Promise<boolean>
  clearError: () => void
  updateActivity: () => void
}

/**
 * Enhanced useAuth hook with Redux integration
 * Provides comprehensive authentication state and actions
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useDispatch<AppDispatch>()
  
  // Select auth state from Redux store
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)
  const tokenExpiry = useSelector(selectTokenExpiry)
  
  // Computed selectors
  const isTokenExpiring = useSelector(selectIsTokenExpiring)
  const shouldRefreshToken = useSelector(selectShouldRefreshToken)
  
  // Initialize activity tracker
  useEffect(() => {
    if (!activityTracker) {
      activityTracker = new ActivityTracker(dispatch)
    }
    
    activityTracker.setAuthState(isAuthenticated)
    
    return () => {
      if (activityTracker) {
        activityTracker.cleanup()
        activityTracker = null
      }
    }
  }, [dispatch, isAuthenticated])
  
  // Auto-verify token on mount if token exists
  useEffect(() => {
    if (token && !user && !isLoading) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(verifyTokenAsync() as any)
    }
  }, [token, user, isLoading, dispatch])
  
  // Memoized action creators
  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await dispatch(loginAsync({ username, password }) as any)
        
        if (loginAsync.fulfilled.match(result)) {
          return { success: true }
        } else if (loginAsync.rejected.match(result)) {
          return { 
            success: false, 
            error: result.payload as string || 'Login failed' 
          }
        }
        
        return { success: false, error: 'Unknown error occurred' }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Login failed' 
        }
      }
    },
    [dispatch]
  )
  
  const logout = useCallback(async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(logoutAsync() as any)
  }, [dispatch])
  
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await dispatch(refreshTokenAsync() as any)
      return refreshTokenAsync.fulfilled.match(result)
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }, [dispatch])
  
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await dispatch(verifyTokenAsync() as any)
      return verifyTokenAsync.fulfilled.match(result)
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }, [dispatch])
  
  const clearAuthError = useCallback((): void => {
    dispatch(clearError())
  }, [dispatch])
  
  const updateUserActivity = useCallback((): void => {
    dispatch(updateActivity())
  }, [dispatch])
  
  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // State
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      tokenExpiry,
      
      // Computed properties
      isTokenExpiring,
      shouldRefreshToken,
      
      // Actions
      login,
      logout,
      refreshToken,
      verifyToken,
      clearError: clearAuthError,
      updateActivity: updateUserActivity,
    }),
    [
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      tokenExpiry,
      isTokenExpiring,
      shouldRefreshToken,
      login,
      logout,
      refreshToken,
      verifyToken,
      clearAuthError,
      updateUserActivity,
    ]
  )
}