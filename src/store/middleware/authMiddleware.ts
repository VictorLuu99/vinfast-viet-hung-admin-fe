import { AnyAction } from '@reduxjs/toolkit'
import {
  refreshTokenAsync,
  updateActivity,
  forceLogout,
  selectShouldRefreshToken,
  selectIsSessionExpired,
  selectIsAuthenticated,
  AuthState
} from '../authSlice'

// Activity tracking actions that should update lastActivity
const ACTIVITY_ACTIONS = [
  'auth/login/fulfilled',
  'news/',
  'contacts/',
  'knowledge/',
  'recruitment/',
  'upload/',
]

// Middleware for automatic token refresh and activity tracking
export const authMiddleware = (store: { getState: () => unknown; dispatch: (action: unknown) => unknown }) => {
  let refreshPromise: Promise<unknown> | null = null
  let activityTimer: NodeJS.Timeout | null = null
  
  // Check token expiry every minute
  const tokenCheckInterval = setInterval(() => {
    const state = store.getState() as { auth: AuthState }
    const shouldRefresh = selectShouldRefreshToken(state)
    const isAuthenticated = selectIsAuthenticated(state)
    const isSessionExpired = selectIsSessionExpired(state)
    
    // Force logout if session expired
    if (isAuthenticated && isSessionExpired) {
      console.log('Session expired due to inactivity, forcing logout')
      store.dispatch(forceLogout())
      return
    }
    
    // Auto-refresh token if needed
    if (shouldRefresh && !refreshPromise) {
      console.log('Token expiring soon, auto-refreshing...')
      refreshPromise = (store.dispatch(refreshTokenAsync() as never) as Promise<unknown>)
        .finally(() => {
          refreshPromise = null
        })
    }
  }, 60000) // Check every minute
  
  // Clear interval on app unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(tokenCheckInterval)
      if (activityTimer) clearTimeout(activityTimer)
    })
  }

  return (next: (action: AnyAction) => unknown) => (action: AnyAction) => {
    // Track user activity
    if (typeof action.type === 'string') {
      const isActivityAction = ACTIVITY_ACTIONS.some(activityAction => 
        action.type.startsWith(activityAction)
      )
      
      if (isActivityAction) {
        // Debounce activity updates (don't spam the store)
        if (activityTimer) {
          clearTimeout(activityTimer)
        }
        
        activityTimer = setTimeout(() => {
          store.dispatch(updateActivity())
        }, 1000) // Update activity at most once per second
      }
    }
    
    return next(action)
  }
}

// Activity tracker for user interactions (clicks, keystrokes, etc.)
export class ActivityTracker {
  private dispatch: (action: { type: string }) => unknown
  private isAuthenticated: boolean = false
  private debounceTimer: NodeJS.Timeout | null = null
  
  constructor(dispatch: (action: { type: string }) => unknown) {
    this.dispatch = dispatch
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    if (typeof window === 'undefined') return
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      window.addEventListener(event, this.handleActivity.bind(this), { passive: true })
    })
  }
  
  private handleActivity = () => {
    if (!this.isAuthenticated) return
    
    // Debounce activity updates
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    this.debounceTimer = setTimeout(() => {
      this.dispatch(updateActivity())
    }, 30000) // Update at most every 30 seconds for user interactions
  }
  
  public setAuthState(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated
  }
  
  public cleanup() {
    if (typeof window === 'undefined') return
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      window.removeEventListener(event, this.handleActivity)
    })
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}