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
  profile (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/me`

    return this.http('http://localhost:5000/api/request')
      .post('get', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
