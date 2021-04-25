import api from '../index'
import Config from '@/config/app'

const { http } = api

/**
 * ===================
 * Page API
 * ===================
 */
export default {
  baseUrl: Config.services.titan22.url,
  http,

  get (params) {
    try {
      params.url = this.baseUrl
      params.method = 'GET'

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
