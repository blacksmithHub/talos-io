import api from '../index'

const { http } = api

/**
 * ===================
 * Transaction API
 * ===================
 */
export default {
  baseUrl: 'http://localhost:5000/api',
  url: 'orders',
  http,

  /**
   * Places an order for a specified cart.
   *
   */
  placeOrder (params) {
    return this.http(this.baseUrl)
      .post(`${this.url}`, params)
      .then(response => response)
      .catch(({ response }) => response)
  }
}
