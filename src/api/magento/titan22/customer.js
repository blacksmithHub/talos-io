import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Customer API
 * ===================
 */
export default {
  baseUrl: `${Config.services.titan22.url}/rest/default/V1`,
  url: 'customers',
  http,

  /**
   * Get user profile
   *
   */
  profile (token) {
    try {
      return this.http(this.baseUrl, token)
        .get(`${this.url}/me`)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  }
}
