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
   * @param params
   * @return mixed
   */
  async fetchToken (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}`
      params.method = 'POST'

      return this.http(params)
        .then((response) => {
          if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) return JSON.parse(response.body)

          return { error: response }
        })
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  }
}
