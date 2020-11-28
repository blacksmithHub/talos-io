import api from './index'
import Config from '@/config/app'

const { http } = api

/**
 * =======================================
 * API Request for Authorization
 * =======================================
 */
export default {
  baseUrl: `${Config.services.auth.url}/api`,
  http,

  /**
   * Bind key
   */
  bind (params) {
    return this.http(this.baseUrl)
      .put('/bind', params)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Unbind key
   */
  unbind (params) {
    return this.http(this.baseUrl)
      .put('/unbind', params)
      .then(response => response)
      .catch(({ response }) => response)
  },

  /**
   * Verify key
   */
  verify (params) {
    return this.http(this.baseUrl)
      .post('/verify', params)
      .then(response => response)
      .catch(({ response }) => response)
  }
}
