import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Cart API
 * ===================
 */
export default {
  baseUrl: `${Config.services.titan22.url}/rest/V1`,
  url: 'carts',
  http,

  /**
   * Create cart
   *
   */
  create (token, cancelToken) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine`, {}, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Get cart
   *
   */
  get (token, cancelToken) {
    return this.http(this.baseUrl, token)
      .get(`${this.url}/mine`, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Delete product to cart
   *
   */
  delete (id, token, cancelToken) {
    return this.http(this.baseUrl, token)
      .delete(`${this.url}/mine/items/${id}`, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Store product to cart
   *
   */
  store (params, token, cancelToken) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine/items`, params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Estimate shipping costs.
   *
   */
  estimateShipping (params, token, cancelToken) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine/estimate-shipping-methods-by-address-id`, params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Set shipping and billing information.
   *
   */
  setShippingInformation (params, token, cancelToken) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine/shipping-information`, params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
