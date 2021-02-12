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
   * @param params
   * @return mixed
   */
  profile (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/me`
      params.method = 'GET'

      return this.http(params)
        .then((response) => {
          if (response && response.statusCode && response.statusCode === 200) return JSON.parse(response.body)

          return response
        })
        .catch((err) => err)
    } catch (error) {
      return error
    }
  }
}
