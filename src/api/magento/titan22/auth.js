import api from '../index'

const { http } = api

/**
 * ===================
 * Auth API
 * ===================
 */
export default {
  baseUrl: `${window.location.origin}/rest/default/V1`,
  url: 'integration/customer/token',
  http,

  /**
   * Get user token
   *
   */
  fetchToken (params) {
    try {
      return this.http(this.baseUrl)
        .post(this.url, params)
        .then(({ data }) => data)
        .catch(() => null)
    } catch (error) {
      return null
    }
  }
}
