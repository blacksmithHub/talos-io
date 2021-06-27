import api from './index'
import Config from '@/config/app'

const { http } = api

/**
 * =======================================
 * API Request for Authorization
 * =======================================
 */
export default {
  baseUrl: `http://localhost:${Config.services.port}/api`,
  http,

  /**
   * Fetch user profile
   */
  get () {
    return this.http(this.baseUrl).get('/auth')
  }
}
