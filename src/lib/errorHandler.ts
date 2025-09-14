/**
 * Global error handler for API responses and authentication errors
 */

// Check if an error is a 401 authentication error
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('Authentication expired') || 
           error.message.includes('Unauthorized') ||
           error.message.includes('401')
  }
  return false
}

// Handle authentication errors with user notification
export const handleAuthError = (error: unknown): void => {
  if (isAuthError(error)) {
    console.warn('Authentication error detected:', error)
    // Additional handling could include showing a toast notification
    // The API client will handle the actual redirect
  }
}

// Wrapper for API calls that adds error handling
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall()
  } catch (error) {
    handleAuthError(error)
    throw error // Re-throw so components can still handle the error
  }
}

// Hook to provide error handling in components
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    if (isAuthError(error)) {
      console.warn(`Authentication error${context ? ` in ${context}` : ''}:`, error)
      // Could show toast notification here
      return
    }
    
    // Handle other types of errors
    console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  }

  return { handleError }
}