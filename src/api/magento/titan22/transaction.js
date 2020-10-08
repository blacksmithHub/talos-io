import api from '../index'

const { http } = api

/**
 * ===================
 * Transaction API
 * ===================
 */
export default {
  baseUrl: 'http://titan-bot.api/api',
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
