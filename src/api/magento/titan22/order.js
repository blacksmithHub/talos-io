import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Order API
 * ===================
 */
export default {
  http,

  /**
   * Places paymaya order for a specified cart.
   *
   */
  paymaya (params) {
    try {
      params.url = `${Config.services.titan22.url}/paymaya/checkout/start`
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
   * Get transaction data
   *
   */
  getTransactionData (params) {
    try {
      params.url = `${Config.services.titan22.url}/ccpp/htmlredirect/gettransactiondata`
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
   * Places 2c2p order for a specified cart.
   *
   */
  place2c2pOrder (params) {
    try {
      params.url = `${Config.services.titan22.checkout}/RedirectV3/Payment`
      params.method = 'POST'
      params.accept = 'application/x-www-form-urlencoded'

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
