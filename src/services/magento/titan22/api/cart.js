import api from './index'

const { http } = api

/**
 * ===================
 * Cart API
 * ===================
 */
export default {
  baseUrl: `${window.location.origin}/rest/default/V1`,
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
    } catch (error) {
      return null
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
    } catch (error) {
      return null
    }
  },

  /**
   * Delete product to cart
   *
   */
  delete (id) {
    try {
      return this.http(this.baseUrl)
        .delete(`${this.url}/mine/items/${id}`)
        .then(({ data }) => data)
    } catch (error) {
      return null
    }
  },

  /**
   * Store product to cart
   *
   */
  store (params) {
    try {
      return this.http(this.baseUrl)
        .post(`${this.url}/mine/items`, params)
        .then(({ data }) => data)
    } catch (error) {
      return null
    }
  }
}
