import { ipcRenderer } from 'electron'
import AuthService from '@/services/auth'
import AuthAPI from '@/api/auth'

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

      ipcRenderer.send('authenticate')
    } else {
      const params = {
        discord_id: 123,
        key: AuthService.getAuth().key
      }

      await AuthAPI.verify(params)
        .then((response) => {
          switch (response.status) {
            case 200:
              if (!response.data) {
                sessionStorage.clear()
                AuthService.flush()

                ipcRenderer.send('authenticate')
              }
              break

            default:
              sessionStorage.clear()
              AuthService.flush()

              ipcRenderer.send('authenticate')
              break
          }
        })
    }

    return next()
  }
}
