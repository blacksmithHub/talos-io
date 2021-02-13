import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Braintree API
 * ===================
 */
export default {
  baseUrl: `${Config.services.braintree.url}/merchants/nw7drdhqdjqh5x6n/client_api/v1`,
  http,

  /**
   * Create paypal payment resource
   *
   */
  createPaymentResource (params) {
    try {
      params.url = `${this.baseUrl}/paypal_hermes/create_payment_resource`
      params.method = 'POST'

      return this.http(params)
        .then((response) => {
          if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) return JSON.parse(response.body)

          return { error: response }
        })
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },
  /**
   * Get paypal account
   *
   */
  getPaypalAccount (params) {
    try {
      params.url = `${this.baseUrl}/payment_methods/paypal_accounts`
      params.method = 'POST'

      return this.http(params)
        .then((response) => {
          if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) return JSON.parse(response.body)

          return { error: response }
        })
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },
  /**
   * Get merchant secret
   */
  getSecret () {
    try {
      const params = {
        url: `${Config.services.titan22.url}/rest/V1/braintree/merchant_server`,
        method: 'GET'
      }

      return this.http(params)
        .then((response) => {
          if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) return JSON.parse(response.body)

          return { error: response }
        })
        .catch((err) => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  }
}
