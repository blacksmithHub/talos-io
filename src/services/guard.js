import { ipcRenderer } from 'electron'
import AuthService from '@/services/auth'

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * =======================================
 * Route Guards
 * =======================================
 */
export default {
  /**
   * Route guard for protected endpoints.
   *
   * @param next
   * @return next
   */
  async authorized (next) {
    if (isDevelopment) return next()

    const isAuthenticated = await AuthService.isAuthenticated()

    if (!isAuthenticated) ipcRenderer.send('logout')

    return next()
  }
}
