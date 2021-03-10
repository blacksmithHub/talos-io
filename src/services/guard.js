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
    if (!isDevelopment) {
      if (!AuthService.isAuthenticated()) {
        ipcRenderer.send('logout')
      } else {
        const params = { key: AuthService.getAuth().key }

        await AuthService.verify(params)
          .then(({ data }) => {
            if (!data) ipcRenderer.send('logout')
          })
          .catch(() => ipcRenderer.send('logout'))
      }
    }

    return next()
  }
}
