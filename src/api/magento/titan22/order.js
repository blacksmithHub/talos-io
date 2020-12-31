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
   * Places 2c2p order for a specified cart.
   *
   */
  place2c2pOrder (params, cancelToken) {
    return this.http(this.local)
      .post(`${this.url}/2c2p`, params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Places paymaya order for a specified cart.
   *
   */
  placePaymayaOrder (params, cancelToken) {
    return this.http(this.local)
      .post(`${this.url}/paymaya`, params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
