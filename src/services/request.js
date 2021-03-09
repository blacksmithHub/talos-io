/**
 * ===============================================
 * Request service
 * ===============================================
 */
export default {
  /**
   * Set request
   *
   * @param {*} mode
   * @param {*} data
   */
  setRequest (mode, data) {
    const UserAgent = require('user-agents')
    const rp = require('request-promise')

    const option = {}

    if (mode) {
      switch (mode.id) {
        case 2:
        case 3:
          option.deviceCategory = 'mobile'
          break
      }
    }

    const userAgent = new UserAgent(option)
    const jar = rp.jar()
    let proxy = 'local'

    if (data) {
      if (data.username && data.password) {
        proxy = `http://${data.username}:${data.password}@${data.host}:${data.port}`
      } else {
        proxy = `http://${data.host}:${data.port}`
      }
    }

    return {
      jar: jar,
      rp: rp,
      proxy: proxy,
      userAgent: userAgent.toString(),
      options: null,
      request: null
    }
  }
}
