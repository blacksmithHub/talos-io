import api from '../index'
import qs from 'qs'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Product API
 * ===================
 *
 */
export default {
  baseUrl: `${Config.services.titan22.url}/rest/V2`,
  url: 'products',
  http,

  /**
   * Search product
   *
   */
  search (params) {
    try {
      const query = qs.stringify(params.payload)

      params.url = `${this.baseUrl}/${this.url}?${query}`
      params.method = 'GET'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  }
}
