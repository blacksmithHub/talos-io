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
  create (token) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine`)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Get cart
   *
   */
  get (token) {
    return this.http(this.baseUrl, token)
      .get(`${this.url}/mine`)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Delete product to cart
   *
   */
  delete (id, token) {
    return this.http(this.baseUrl, token)
      .delete(`${this.url}/mine/items/${id}`)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Store product to cart
   *
   */
  store (params, token) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine/items`, params)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Estimate shipping costs.
   *
   */
  estimateShipping (params, token) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine/estimate-shipping-methods-by-address-id`, params)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Set shipping and billing information.
   *
   */
  setShippingInformation (params, token) {
    return this.http(this.baseUrl, token)
      .post(`${this.url}/mine/shipping-information`, params)
      .then(response => response)
      .catch(({ response }) => response)
  }
}
