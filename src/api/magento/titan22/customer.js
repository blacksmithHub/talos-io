import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Customer API
 * ===================
 */
export default {
  local: `http://localhost:${Config.services.port}/api`,
  baseUrl: `${Config.services.titan22.url}/rest/default/V1`,
  url: 'customers',
  http,

  /**
   * Get user profile
   *
   */
  profile (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/me`

    return this.http(`${this.local}/request`)
      .post('get', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
