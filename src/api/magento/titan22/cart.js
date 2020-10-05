import api from '../index'

const { http } = api

/**
 * ===================
 * Cart API
 * ===================
 */
export default {
  baseUrl: `${window.location.origin}/rest/V1`,
  url: 'carts',
  http,

  /**
   * Create cart
   *
   */
  create (token) {
    try {
      return this.http(this.baseUrl, token)
        .post(`${this.url}/mine`)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Get cart
   *
   */
  get (token) {
    try {
      return this.http(this.baseUrl, token)
        .get(`${this.url}/mine`)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Delete product to cart
   *
   */
  delete (id, token) {
    try {
      return this.http(this.baseUrl, token)
        .delete(`${this.url}/mine/items/${id}`)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Store product to cart
   *
   */
  store (params, token) {
    try {
      return this.http(this.baseUrl, token)
        .post(`${this.url}/mine/items`, params)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Estimate shipping costs.
   *
   */
  estimateShipping (params, token) {
    try {
      return this.http(this.baseUrl, token)
        .post(`${this.url}/mine/estimate-shipping-methods-by-address-id`, params)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Set shipping and billing information.
   *
   */
  setShippingInformation (params, token) {
    try {
      return this.http(this.baseUrl, token)
        .post(`${this.url}/mine/shipping-information`, params)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  },

  /**
   * Places an order for a specified cart.
   *
   */
  createOrder (params, token) {
    try {
      return this.http(this.baseUrl, token)
        .post(`${this.url}/mine/payment-information`, params)
        .then(({ data }) => data)
        .catch(() => false)
    } catch (error) {
      return false
    }
  }
}
