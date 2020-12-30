import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Order API
 * ===================
 */
export default {
  local: `http://localhost:${Config.services.port}/api`,
  url: 'order',
  http,

  /**
   * Places an order for a specified cart.
   *
   */
  placeOrder (params, cancelToken) {
    return this.http(this.local)
      .post(`${this.url}`, params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
