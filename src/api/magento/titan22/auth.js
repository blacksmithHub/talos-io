import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Auth API
 * ===================
 */
export default {
  local: `http://localhost:${Config.services.port}/api`,
  baseUrl: `${Config.services.titan22.url}/rest/default/V1`,
  url: 'integration/customer/token',
  http,

  /**
   * Get user token
   *
   */
  fetchToken (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}`
    params.method = 'POST'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
