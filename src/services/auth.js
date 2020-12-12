/**
 * ===============================================
 * Auth service
 * ===============================================
 *
 * Provides authentication properties and actions
 *
 * ===============================================
 */

export default {
  /**
   * Formats and stores the auth access in localStorage
   *
   * @param data
   */
  setAuth (data) {
    localStorage.setItem('auth', data)
  },

  /**
   * Gets the auth access in localStorage.
   *
   * @return {*}
   */
  getAuth () {
    return JSON.parse(localStorage.getItem('auth'))
  },

  /**
   * Verify if authenticated
   *
   * @return bool
   */
  isAuthenticated () {
    return !!this.getAuth()
  },

  /**
   * Removes auth and user from localStorage.
   *
   */
  flush () {
    localStorage.removeItem('auth')
  }
}
