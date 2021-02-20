import api from '../index'
import Config from '@/config/app'
import CloudflareBypasser from 'cloudflare-bypasser'
import request from 'request'
import UserAgent from 'user-agents'

const { http } = api

/**
 * ===================
 * Order API
 * ===================
 */
export default {
  baseUrl: `${Config.services.titan22.url}/rest/default/V1`,
  url: 'carts/mine/payment-information',
  http,

  /**
   * Places 2c2p order for a specified cart.
   *
   */
  place2c2pOrder (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}`
      params.method = 'POST'

      const cf = new CloudflareBypasser()
      const jar = request.jar()

      let agent = null
      let client = null
      let proxy = null

      switch (params.mode) {
        case 'Mobile (Android)':
          {
            const userAgentAnd = new UserAgent({ deviceCategory: 'mobile' })
            agent = userAgentAnd.toString()
            client = 'android'
          }
          break

        case 'Mobile (iOS)':
          {
            const userAgentIos = new UserAgent({ deviceCategory: 'mobile' })
            agent = userAgentIos.toString()
            client = 'ios'
          }
          break
        default:
          {
            const userAgent = new UserAgent()
            agent = userAgent.toString()
          }
          break
      }

      if (params.proxy && Object.keys(params.proxy).length && params.proxy.proxies.length) {
        const proxies = params.proxy.proxies[Math.floor(Math.random() * params.proxy.proxies.length)]

        if (proxies.username && proxies.password) {
          proxy = `http://${proxies.username}:${proxies.password}@${proxies.host}:${proxies.port}`
        } else {
          proxy = `http://${proxies.host}:${proxies.port}`
        }
      }

      const config = {
        method: params.method,
        url: params.url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
          'User-Agent': agent
        },
        body: JSON.stringify(params.payload),
        jar: jar
      }

      if (client) config.headers.client = client

      if (proxy) config.proxy = proxy

      return cf.request(config)
        .then((response) => {
          if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            const config = {
              method: 'GET',
              url: `${Config.services.titan22.url}/ccpp/htmlredirect/gettransactiondata`,
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': agent
              },
              jar: jar
            }

            if (client) config.headers.client = client

            if (proxy) config.proxy = proxy

            return cf.request(config)
              .then((response) => {
                if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                  let orderNumber = null
                  const parameters = {}
                  const fieldRecords = JSON.parse(response.body).fields
                  const valueRecords = JSON.parse(response.body).values

                  for (let index = 0; index < fieldRecords.length; index++) {
                    parameters[fieldRecords[index]] = valueRecords[index]
                    if (fieldRecords[index] === 'order_id') orderNumber = valueRecords[index]
                  }

                  const config = {
                    method: 'POST',
                    url: `${Config.services.titan22.checkout}/RedirectV3/Payment`,
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'User-Agent': agent
                    },
                    form: parameters,
                    jar: jar
                  }

                  if (client) config.headers.client = client

                  if (proxy) config.proxy = proxy

                  return cf.request(config)
                    .then(async () => {
                      let response = null

                      await jar._jar.store.getAllCookies(function (err, cookieArray) {
                        if (err) return { error: err }

                        const collection = cookieArray.find((val) => val.key === 'ASP.NET_SessionId')

                        response = {
                          cookie: {
                            name: 'ASP.NET_SessionId',
                            value: collection.value,
                            domain: '.2c2p.com',
                            expiry: collection.expiry
                          },
                          data: orderNumber
                        }
                      })

                      return response
                    })
                    .catch(async () => {
                      let response = null

                      await jar._jar.store.getAllCookies(function (err, cookieArray) {
                        if (err) return { error: err }

                        const collection = cookieArray.find((val) => val.key === 'ASP.NET_SessionId')

                        response = {
                          cookie: {
                            name: 'ASP.NET_SessionId',
                            value: collection.value,
                            domain: '.2c2p.com',
                            expiry: collection.expiry
                          },
                          data: orderNumber
                        }
                      })

                      return response
                    })
                } else {
                  return { error: response }
                }
              })
              .catch(err => {
                return { error: err }
              })
          } else {
            return { error: response }
          }
        })
        .catch(err => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  },

  /**
   * Places paymaya order for a specified cart.
   *
   */
  placePaymayaOrder (params) {
    try {
      params.url = `${this.baseUrl}/${this.url}`
      params.method = 'POST'

      const cf = new CloudflareBypasser()
      const jar = request.jar()

      let agent = null
      let client = null
      let proxy = null

      switch (params.mode) {
        case 'Mobile (Android)':
          {
            const userAgentAnd = new UserAgent({ deviceCategory: 'mobile' })
            agent = userAgentAnd.toString()
            client = 'android'
          }
          break

        case 'Mobile (iOS)':
          {
            const userAgentIos = new UserAgent({ deviceCategory: 'mobile' })
            agent = userAgentIos.toString()
            client = 'ios'
          }
          break
        default:
          {
            const userAgent = new UserAgent()
            agent = userAgent.toString()
          }
          break
      }

      if (params.proxy && Object.keys(params.proxy).length && params.proxy.proxies.length) {
        const proxies = params.proxy.proxies[Math.floor(Math.random() * params.proxy.proxies.length)]

        if (proxies.username && proxies.password) {
          proxy = `http://${proxies.username}:${proxies.password}@${proxies.host}:${proxies.port}`
        } else {
          proxy = `http://${proxies.host}:${proxies.port}`
        }
      }

      const config = {
        method: params.method,
        url: params.url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
          'User-Agent': agent
        },
        body: JSON.stringify(params.payload),
        jar: jar
      }

      if (client) config.headers.client = client

      if (proxy) config.proxy = proxy

      return cf.request(config)
        .then((response) => {
          if (response && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            const config = {
              method: 'GET',
              url: `${Config.services.titan22.url}/paymaya/checkout/start`,
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': agent
              },
              jar: jar
            }

            if (client) config.headers.client = client

            if (proxy) config.proxy = proxy

            return cf.request(config)
              .then((response) => response)
              .catch(err => {
                return { error: err }
              })
          } else {
            return { error: response }
          }
        })
        .catch(err => {
          return { error: err }
        })
    } catch (error) {
      return { error: error }
    }
  }
}
