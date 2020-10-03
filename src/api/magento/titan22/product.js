import api from '../index'
import qs from 'qs'

const { http } = api

/**
 * ===================
 * Product API
 * ===================
 */
export default {
  baseUrl: `${window.location.origin}/rest/V2`,
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
        .catch(() => null)
    } catch (error) {
      return null
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
        .catch(() => null)
    } catch (error) {
      return null
    }
  }
}
