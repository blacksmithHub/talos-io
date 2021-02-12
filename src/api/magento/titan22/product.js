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
        .then((response) => {
          if (response && response.statusCode && response.statusCode === 200) return JSON.parse(response.body)

          return response
        })
        .catch((err) => err)
    } catch (error) {
      return error
    }
  },

  /**
   * Search product attributes
   *
   */
  attribute (params) {
    try {
      const query = qs.stringify(params.payload)

      params.url = `${this.baseUrl}/${this.url}/attributes?${query}`
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
