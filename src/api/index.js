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
  http (baseUrl) {
    const http = axios.create({ baseURL: baseUrl })

    http.interceptors.request.use(async config => {
      /**
       * Set Headers config
       */
      config.headers.Accept = 'application/json'

      return config
    })

    return http
  },

  /**
   * Store a newly created resource in storage.
   *
   */
  store (payload) {
    return this.http(this.baseUrl)
      .post(`${this.url}`, payload)
  },

  /**
   * Update the specified resource in storage.
   *
   */
  put (payload) {
    return this.http(this.baseUrl)
      .put(`${this.url}`, payload)
  }
}
