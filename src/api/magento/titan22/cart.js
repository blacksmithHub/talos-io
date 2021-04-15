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
   * @param params
   * @return mixed
   */
  create (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine`
      params.method = 'POST'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Get cart
   *
   * @param params
   * @return mixed
   */
  get (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine`
      params.method = 'GET'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Delete product to cart
   *
   * @param params
   * @return mixed
   */
  delete (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine/items/${params.id}`
      params.method = 'DELETE'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Store product to cart
   *
   * @param params
   * @return mixed
   */
  store (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine/items`
      params.method = 'POST'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Estimate shipping costs.
   *
   * @param params
   * @return mixed
   */
  estimateShipping (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine/estimate-shipping-methods-by-address-id`
      params.method = 'POST'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Set shipping and billing information.
   *
   * @param params
   * @return mixed
   */
  setShippingInformation (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine/shipping-information`
      params.method = 'POST'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Place order
   *
   * @param params
   * @return mixed
   */
  paymentInformation (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}/mine/payment-information`
      params.method = 'POST'

      return this.http(params)
        .then((res) => res)
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  }
}
