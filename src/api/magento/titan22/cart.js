import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Cart API
 * ===================
 */
export default {
  local: `http://localhost:${Config.services.port}/api`,
  baseUrl: `${Config.services.titan22.url}/rest/V1`,
  url: 'carts',
  http,

  /**
   * Create cart
   *
   */
  create (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine`

    return this.http(`${this.local}/request`)
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Get cart
   *
   */
  get (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine`

    return this.http(`${this.local}/request`)
      .post('get', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Delete product to cart
   *
   */
  delete (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/items/${params.id}`

    return this.http(`${this.local}/request`)
      .post('delete', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Store product to cart
   *
   */
  store (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/items`

    return this.http(`${this.local}/request`)
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Estimate shipping costs.
   *
   */
  estimateShipping (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/estimate-shipping-methods-by-address-id`

    return this.http(`${this.local}/request`)
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Set shipping and billing information.
   *
   */
  setShippingInformation (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/shipping-information`

    return this.http(`${this.local}/request`)
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Place order
   */
  paymentInformation (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/payment-information`

    return this.http(`${this.local}/request`)
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
