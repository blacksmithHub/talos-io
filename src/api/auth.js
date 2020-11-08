import api from './index'
import Config from '@/config/app'

const { http } = api

/**
 * =======================================
 * API Request for Authorization
 * =======================================
 */
export default {
  baseUrl: `${Config.services.api.auth}/api`,
  http,

  /**
   * Bind key
   */
  bind (params) {
    return this.http(this.baseUrl)
      .post('/bind', params)
      .then(response => response)
      .catch(({ response }) => response)
  }
}
