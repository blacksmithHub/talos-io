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
  create (params, cancelToken) {
    params.url = `${this.baseUrl}/${this.url}/mine`

    return this.http('http://localhost:5000/api/request')
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

    return this.http('http://localhost:5000/api/request')
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

    return this.http('http://localhost:5000/api/request')
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

    return this.http('http://localhost:5000/api/request')
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

    return this.http('http://localhost:5000/api/request')
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

    return this.http('http://localhost:5000/api/request')
      .post('post', params, { cancelToken: cancelToken })
      .then(response => response)
      .catch(({ response }) => response)
  }
}
