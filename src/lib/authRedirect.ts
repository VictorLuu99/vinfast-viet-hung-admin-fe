/**
 * Shared auth failure handling: clear session and redirect to login.
 * Used on 401, "token not found", or any auth-related error.
 */

const PERSIST_KEY = 'persist:admin-root'
const TOKEN_COOKIE = 'admin-token'
const TOKEN_STORAGE = 'admin-token'

/**
 * Clears token cookie, localStorage token, and persisted Redux auth state,
 * then redirects to /login. Safe to call from any context (no Redux required).
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return

  try {
    document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    localStorage.removeItem(TOKEN_STORAGE)
    localStorage.removeItem(PERSIST_KEY)
  } catch {
    // ignore storage errors
  }

  window.location.href = '/login'
}

/**
 * Returns true if the error indicates auth failure (401 or token not found).
 */
export function isAuthFailureError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('401') ||
      msg.includes('không tìm thấy token') ||
      msg.includes('token xác thực') ||
      msg.includes('authentication expired') ||
      msg.includes('unauthorized')
    )
  }
  return false
}
