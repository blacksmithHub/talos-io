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
    let host = 'local'

    if (data) host = data.host

    return {
      jar: jar,
      rp: rp,
      host: host,
      userAgent: userAgent.toString(),
      options: null,
      request: null
    }
  }
}
