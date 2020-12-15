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
  fetchToken (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}`

    return this.http('http://localhost:5000/api/request')
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
