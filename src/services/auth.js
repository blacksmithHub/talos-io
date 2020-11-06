import axios from 'axios'
import Config from '@/config/app'

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
   * @return * { token_type, access_token, refresh_token, expires_in, expiration_date }
   */
  getAuth () {
    return JSON.parse(localStorage.getItem('auth'))
  },

  /**
   * store the user data in localStorage
   *
   * @param data
   */
  setUser (data) {
    localStorage.setItem('user', JSON.stringify(data))
  },

  /**
   * Gets the user data in localStorage.
   *
   * @return {*}
   */
  getUser () {
    return JSON.parse(localStorage.getItem('user'))
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
   * Gets the access_token from auth.
   *
   * @return string
   */
  getAccessToken () {
    return this.getAuth() ? this.getAuth().access_token : null
  },

  /**
   * Removes auth and user from localStorage.
   *
   */
  flush () {
    localStorage.removeItem('auth')
    localStorage.removeItem('user')
  },

  /**
   * Sends an auth check request to Auth API.
   *
   * @return {*} http
   */
  verifyAccessToken () {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${this.getAccessToken()}`
    }

    return axios.get(`${Config.services.auth.url}/api/v1/user/auth`, { headers })
  }
}
