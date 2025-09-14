'use client'

import React, { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store'
import { apiClient } from '@/lib/apiClient'

interface ReduxProviderProps {
  children: React.ReactNode
}

/**
 * Redux Provider component that wraps the entire app
 * Initializes the Redux store, persistence, and API client integration
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      // Initialize API client with Redux store
      apiClient.initializeStore(store.dispatch, store.getState)
      initialized.current = true
    }
  }, [])

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
        persistor={persistor}
      >
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </PersistGate>
    </Provider>
  )
}

/**
 * Component that handles auth initialization after store rehydration
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      // Auth initialization will be handled by the authSlice and middleware
      // The token verification will happen automatically through the auth system
      initialized.current = true
    }
  }, [])

  return <>{children}</>
}