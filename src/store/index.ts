import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { authSlice } from './authSlice'
import { authMiddleware } from './middleware/authMiddleware'

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice.reducer,
})

// Redux-persist configuration
const persistConfig = {
  key: 'admin-root',
  storage,
  whitelist: ['auth'], // Only persist auth state
  transforms: [], // We can add encryption transforms here later
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store with middleware
const storeConfig = {
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: (config?: object) => unknown[]) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
}

// @ts-expect-error - Complex middleware type conflicts resolved at runtime
export const store = configureStore(storeConfig)

export const persistor = persistStore(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch