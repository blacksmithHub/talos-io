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
    return this.http(`${this.baseUrl}`)
      .post('paypal_hermes/create_payment_resource', params)
      .then(response => response)
      .catch(({ response }) => response)
  },
  /**
   * Get paypal account
   *
   */
  getPaypalAccount (params) {
    return this.http(`${this.baseUrl}`)
      .post('payment_methods/paypal_accounts', params)
      .then(response => response)
      .catch(({ response }) => response)
  },
  /**
   * Get merchant secret
   */
  getSecret () {
    return this.http(`${Config.services.titan22.url}/rest/V1`)
      .get('braintree/merchant_server')
      .then(response => response)
      .catch(({ response }) => response)
  }
}
