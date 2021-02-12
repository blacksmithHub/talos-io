import CloudflareBypasser from 'cloudflare-bypasser'
import UserAgent from 'user-agents'
import request from 'request'

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

  async http (params) {
    const cf = new CloudflareBypasser()
    const jar = request.jar()

    const config = {
      method: params.method,
      url: params.url,
      headers: { 'Content-Type': 'application/json' },
      jar: jar
    }

    if (params.proxy && Object.keys(params.proxy).length && params.proxy.proxies.length) {
      const proxy = params.proxy.proxies[Math.floor(Math.random() * params.proxy.proxies.length)]

      if (proxy.username && proxy.password) {
        config.proxy = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
      } else {
        config.proxy = `http://${proxy.host}:${proxy.port}`
      }
    }

    if (params.payload) config.body = JSON.stringify(params.payload)

    if (params.token) config.headers.Authorization = `Bearer ${params.token}`

    switch (params.mode) {
      case 'Mobile (Android)':
        {
          const userAgentAnd = new UserAgent({ deviceCategory: 'mobile' })
          config.headers['User-Agent'] = userAgentAnd.toString()
          config.headers.client = 'android'
        }
        break

      case 'Mobile (iOS)':
        {
          const userAgentIos = new UserAgent({ deviceCategory: 'mobile' })
          config.headers['User-Agent'] = userAgentIos.toString()
          config.headers.client = 'ios'
        }
        break
      default:
        {
          const userAgent = new UserAgent()
          config.headers['User-Agent'] = userAgent.toString()
        }
        break
    }

    return cf.request(config)
  }
}
