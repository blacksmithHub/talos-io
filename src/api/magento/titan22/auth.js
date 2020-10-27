import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Auth API
 * ===================
 */
export default {
  baseUrl: `${Config.services.titan22.url}/rest/default/V1`,
  url: 'integration/customer/token',
  http,

  /**
   * Get user token
   *
   */
  fetchToken (params) {
    return this.http(this.baseUrl)
      .post(this.url, params)
      .then(response => response)
      .catch(({ response }) => response)
  }
}
