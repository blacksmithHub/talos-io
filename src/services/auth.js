import AuthAPI from '@/api/auth'
import fs from 'fs'

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
   * Gets the auth access in local storage.
   *
   * @return {*}
   */
  getAuth () {
    let data = null

    try {
      data = JSON.parse(fs.readFileSync('User.json', 'utf8'))
    } catch (error) {
      data = null
    }

    return data
  },

  /**
   * Verify if authenticated
   *
   * @return bool
   */
  async isAuthenticated () {
    const response = await AuthAPI.get()
      .then(({ data }) => data)
      .catch(({ response }) => response)

    return !(response.status)
  },

  /**
   * Logout discord
   *
   * @return {*}
   */
  logout () {
    return fs.writeFileSync('User.json', '')
  }
}
