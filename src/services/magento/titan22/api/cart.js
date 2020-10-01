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
   * Store cart
   *
   */
  storeCart () {
    return this.http(this.baseUrl)
      .post(`${this.url}/mine`)
  },

  /**
   * Get cart
   *
   */
  showCart () {
    return this.http(this.baseUrl)
      .get(`${this.url}/mine`)
  },

  /**
   * Delete product to cart
   *
   */
  deleteProduct (id) {
    return this.http(this.baseUrl)
      .delete(`${this.url}/mine/items/${id}`)
  },

  /**
   * Store product to cart
   *
   */
  storeProduct (params) {
    return this.http(this.baseUrl)
      .post(`${this.url}/mine/items`, params)
  }
}
