import AuthService from '@/services/auth'
import { ipcRenderer } from 'electron'

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

    // AuthService.verifyAccessKey()
    //   .then((response) => {
    //     console.log(response)
    //   })

    return next()
  }
}
