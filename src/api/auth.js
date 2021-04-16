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
  login (params) {
    return this.http(this.baseUrl).post('/login', params)
  },

  /**
   * Verify key
   */
  verify (params) {
    return this.http(this.baseUrl).post('/verify', params)
  }
}
