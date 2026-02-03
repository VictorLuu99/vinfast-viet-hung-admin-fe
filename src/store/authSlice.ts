import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vinfastxemaydien.com'

// Types
export interface User {
  id: string
  username: string
  email?: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokenExpiry: number | null
  lastActivity: number
  sessionExtended: boolean
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenExpiry: null,
  lastActivity: Date.now(),
  sessionExtended: false,
}

// Async thunks for API calls
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      
      // Set cookie for middleware
      if (typeof window !== 'undefined' && data.data?.token) {
        document.cookie = `admin-token=${data.data.token}; path=/; max-age=86400; SameSite=Lax; Secure=${location.protocol === 'https:'}`
      }

      return {
        token: data.data?.token,
        refreshToken: data.data?.refreshToken,
        user: data.data?.user,
        expiresIn: data.data?.expiresIn || 86400, // Default 24 hours
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const currentToken = state.auth.token

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      // Update cookie
      if (typeof window !== 'undefined' && data.token) {
        document.cookie = `admin-token=${data.token}; path=/; max-age=86400; SameSite=Lax; Secure=${location.protocol === 'https:'}`
      }

      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 86400,
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token refresh failed'
      return rejectWithValue(message)
    }
  }
)

export const verifyTokenAsync = createAsyncThunk(
  'auth/verifyToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const token = state.auth.token

      if (!token) {
        throw new Error('No token available')
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Token verification failed')
      }

      const data = await response.json()
      
      return {
        user: data.user,
        valid: data.valid,
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token verification failed'
      return rejectWithValue(message)
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState }
      const token = state.auth.token

      // Call logout endpoint (best effort)
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local storage and cookies
      if (typeof window !== 'undefined') {
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    }
  }
)

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Update last activity timestamp
    updateActivity: (state) => {
      state.lastActivity = Date.now()
    },
    
    // Mark session as extended
    setSessionExtended: (state, action: PayloadAction<boolean>) => {
      state.sessionExtended = action.payload
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    
    // Set token expiry manually
    setTokenExpiry: (state, action: PayloadAction<number>) => {
      state.tokenExpiry = action.payload
    },
    
    // Force logout (for expired tokens)
    forceLogout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.tokenExpiry = null
      state.error = 'Session expired'
      state.isLoading = false
      
      // Clear cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    },
    
    // Initialize from persisted state
    initializeAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.user = action.payload.user
        state.tokenExpiry = Date.now() + (action.payload.expiresIn * 1000)
        state.lastActivity = Date.now()
        state.error = null
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.refreshToken = null
        state.user = null
        state.tokenExpiry = null
        state.error = action.payload as string
      })

    // Token refresh
    builder
      .addCase(refreshTokenAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.tokenExpiry = Date.now() + (action.payload.expiresIn * 1000)
        state.sessionExtended = true
        state.error = null
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.refreshToken = null
        state.user = null
        state.tokenExpiry = null
        state.error = action.payload as string
      })

    // Token verification
    builder
      .addCase(verifyTokenAsync.fulfilled, (state, action) => {
        if (action.payload.valid) {
          state.user = action.payload.user
          state.isAuthenticated = true
          state.error = null
        } else {
          // Token is invalid
          state.isAuthenticated = false
          state.token = null
          state.refreshToken = null
          state.user = null
          state.tokenExpiry = null
          state.error = 'Invalid token'
        }
        state.isLoading = false
      })
      .addCase(verifyTokenAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.refreshToken = null
        state.user = null
        state.tokenExpiry = null
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.tokenExpiry = null
        state.lastActivity = Date.now()
        state.sessionExtended = false
        state.error = null
        state.isLoading = false
      })
  },
})

// Actions
export const {
  updateActivity,
  setSessionExtended,
  clearError,
  setTokenExpiry,
  forceLogout,
  initializeAuth,
} = authSlice.actions

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectError = (state: { auth: AuthState }) => state.auth.error
export const selectTokenExpiry = (state: { auth: AuthState }) => state.auth.tokenExpiry
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity

// Helper selectors
export const selectIsTokenExpiring = (state: { auth: AuthState }) => {
  const { tokenExpiry } = state.auth
  if (!tokenExpiry) return false
  
  // Check if token expires in less than 5 minutes
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
  return tokenExpiry <= fiveMinutesFromNow
}

export const selectShouldRefreshToken = (state: { auth: AuthState }) => {
  const { tokenExpiry, isAuthenticated, isLoading } = state.auth
  if (!isAuthenticated || isLoading || !tokenExpiry) return false
  
  // Refresh if token expires in less than 5 minutes
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
  return tokenExpiry <= fiveMinutesFromNow
}

export const selectIsSessionExpired = (state: { auth: AuthState }) => {
  const { lastActivity } = state.auth
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000)
  return lastActivity < thirtyMinutesAgo
}