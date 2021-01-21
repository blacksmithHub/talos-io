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
   * Search product attributes
   *
   */
  attribute (params, token) {
    params = qs.stringify(params)

    return this.http(this.baseUrl, token)
      .get(`${this.url}/attributes?${params}`)
      .then(response => response)
      .catch(({ response }) => response)
  }
}
