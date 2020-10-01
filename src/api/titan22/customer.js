import api from '../index'

const { http } = api

/**
 * ===================
 * Customer API
 * ===================
 */
export default {
  baseUrl: `${process.env.VUE_APP_TITAN_URL}/rest/default/V1`,
  url: 'customers',
  http,

  /**
   * Get user profile
   *
   */
  profile () {
    return this.http(this.baseUrl)
      .get(`${this.url}/me`)
  }
}
