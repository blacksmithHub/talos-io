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
  local: `http://localhost:${Config.services.port}/api`,
  baseUrl: `${Config.services.titan22.url}/rest/V2`,
  url: 'products',
  http,

  /**
   * Search product
   *
   */
  search (params) {
    const query = qs.stringify(params.payload)
    params.url = `${this.baseUrl}/${this.url}?${query}`

    return this.http(`${this.local}/request`)
      .post('get', params)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Search product attributes
   *
   */
  attribute (params, token) {
    params = qs.stringify(params)

    return this.http(this.baseUrl, token)
      .get(`${this.url}/attributes?${params}`)
      .then(({ data }) => data)
      .catch(({ response }) => response)
  }
}
