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
        .catch(() => null)
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
        .catch(() => null)
    } catch (error) {
      return null
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
        .catch(() => null)
    } catch (error) {
      return null
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
        .catch(() => null)
    } catch (error) {
      return null
    }
  }
}
