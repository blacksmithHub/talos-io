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
    params.method = 'POST'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  },

  /**
   * Get cart
   *
   */
  get (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine`
    params.method = 'GET'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  },

  /**
   * Delete product to cart
   *
   */
  delete (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/items/${params.id}`
    params.method = 'DELETE'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  },

  /**
   * Store product to cart
   *
   */
  store (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/items`
    params.method = 'POST'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  },

  /**
   * Estimate shipping costs.
   *
   */
  estimateShipping (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/estimate-shipping-methods-by-address-id`
    params.method = 'POST'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  },

  /**
   * Set shipping and billing information.
   *
   */
  setShippingInformation (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/shipping-information`
    params.method = 'POST'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  },

  /**
   * Place order
   */
  paymentInformation (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine/payment-information`
    params.method = 'POST'

    return this.http(`${this.local}/request`)
      .post('/', params, { cancelToken: cancelToken })
      .then(({ data }) => data)
      .catch(({ response }) => response)
  }
}
