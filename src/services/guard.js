import { ipcRenderer } from 'electron'
import AuthService from '@/services/auth'
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
    if (!AuthService.isAuthenticated()) {
      sessionStorage.clear()

      ipcRenderer.send('hide-home')
      ipcRenderer.send('toggle-login')
    }

    // TODO: verify key

    return next()
  }
}
