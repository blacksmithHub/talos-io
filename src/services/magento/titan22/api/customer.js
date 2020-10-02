import api from './index'

const { http } = api

/**
 * ===================
 * Customer API
 * ===================
 */
export default {
  baseUrl: `${window.location.origin}/rest/default/V1`,
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
    } catch (error) {
      return null
    }
  }
}
