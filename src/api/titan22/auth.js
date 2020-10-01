import api from '../index'

const { http } = api

/**
 * ===================
 * Auth API
 * ===================
 */
export default {
  baseUrl: `${process.env.VUE_APP_TITAN_URL}/rest/default/V1`,
  url: 'integration/customer/token',
  http,

  /**
   * Get user token
   *
   */
  fetchToken (params) {
    return this.http(this.baseUrl)
      .post(this.url, params)
  }
}
