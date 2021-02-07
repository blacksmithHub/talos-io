import axios from 'axios'

/**
 *============================================================
 * API
 * ===========================================================
 *
 * Initialize the axios instance with an Authorization header.
 * Refreshes expired token before am API request.
 *
 */
export default {
  /**
   * Creates an axios instance with an access token as authorization header
   *
   * @param String baseUrl
   * @return {*} http
   */
  http (baseUrl, token = null) {
    const http = axios.create({ baseURL: baseUrl })

    http.interceptors.request.use(config => {
      /**
       * Set Headers config
       */
      config.headers.Accept = 'application/json'
      if (token) config.headers.Authorization = `Bearer ${token}`

      return config
    })

    return http
  }
}
