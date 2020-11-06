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
      next('/login')
    }

    /**
     * When user still authenticated and access_token is not expired allow to requested route
     */
    if (!AuthService.isAccessTokenExpired()) {
      if (AuthService.getRegistrationStatus() === 4) {
        return next()
      } else {
        return next('/profile-registration')
      }
    }

    /**
     * When user is not authenticated and expired access_token
     * Attempt refreshing the access_token
     */
    AuthService.refreshToken()
      .then(({ data }) => {
        AuthService.setAuth(data)
        if (AuthService.getRegistrationStatus() === 4) {
          return next()
        } else {
          return next('/profile-registration')
        }
      })
      .catch(() => {
        AuthService.flush()
        sessionStorage.clear()
        return next('/login')
      })
  },

  /**
   * Route Guard for registration endpoint (login, sign-up)
   *
   * @param {*} from
   * @param {*} next
   * @return next
   */
  async registration (from, next) {
    /**
     * When user still authenticated and access_token is not expired retain current route
     */
    if (AuthService.isAuthenticated() && !AuthService.isAccessTokenExpired()) {
      return next(from.path)
    }

    // when not authenticated set indented route
    if (!AuthService.isAuthenticated()) return next()

    /**
     * Attempt refreshing the access_token
     */
    AuthService.refreshToken()
      .then(({ data }) => {
        AuthService.setAuth(data)
        return next(from.path)
      })
      .catch(() => {
        AuthService.flush()
        return next()
      })
  }
}
