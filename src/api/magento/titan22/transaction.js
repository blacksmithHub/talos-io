import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Transaction API
 * ===================
 */
export default {
  baseUrl: `${Config.services.api.url}/api`,
  url: 'place-order',
  http,

  /**
   * Places an order for a specified cart.
   *
   */
  placeOrder (params) {
    try {
      return this.http(this.baseUrl)
        .post(`${this.url}`, params)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  }
}
