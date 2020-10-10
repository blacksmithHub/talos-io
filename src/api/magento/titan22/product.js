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
  search (params, token) {
    try {
      params = qs.stringify(params)

      return this.http(this.baseUrl, token)
        .get(`${this.url}?${params}`)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Search product attributes
   *
   */
  attribute (params, token) {
    try {
      params = qs.stringify(params)

      return this.http(this.baseUrl, token)
        .get(`${this.url}/attributes?${params}`)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  }
}
