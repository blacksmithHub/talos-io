import Url from 'url-parse'
import store from '@/store/index'

/**
 *============================================================
 * API
 * ===========================================================
 *
 * Initialize the axios instance with an Authorization header.
 * Refreshes expired token before am API request.
 */
export default {
  async http (params) {
    const url = new Url('https://cf-js-challenge.sayem.eu.org/') // params.url)
    let config = null
    let rp = null

    if (params.taskId) {
      const vuex = store._modules.root._children.task.context
      const task = vuex.state.items.find((val) => val.id === params.taskId)

      rp = task.rp
      const jar = task.jar
      const userAgent = task.userAgent

      config = {
        method: 'GET', // params.method,
        url: 'https://cf-js-challenge.sayem.eu.org/', // params.url,
        headers: {
          'User-Agent': userAgent,
          referer: `${url.protocol}//${url.host}/`
        },
        jar: jar
      }

      if (task.options) {
        config = {
          ...task.options,
          method: 'GET', // params.method,
          url: 'https://cf-js-challenge.sayem.eu.org/', // params.url,
          headers: {
            ...task.options.headers,
            'User-Agent': userAgent,
            referer: `${url.protocol}//${url.host}/`
          },
          jar: task.options.jar
        }
      }
    } else {
      rp = require('request-promise')
      const jar = rp.jar()
      const userAgent = ''

      config = {
        method: params.method,
        url: params.url,
        headers: {
          'User-Agent': userAgent,
          referer: `${url.protocol}//${url.host}/`
        },
        jar: jar
      }
    }

    if (params.proxy && Object.keys(params.proxy).length && params.proxy.proxies.length) {
      const proxy = params.proxy.proxies[Math.floor(Math.random() * params.proxy.proxies.length)]

      if (proxy.username && proxy.password) {
        config.proxy = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
      } else {
        config.proxy = `http://${proxy.host}:${proxy.port}`
      }
    }

    if (params.payload) {
      config.body = JSON.stringify(params.payload)
    } else {
      delete config.body
    }

    if (params.form) {
      config.form = JSON.stringify(params.form)
    } else {
      delete config.form
    }

    if (params.token) {
      config.headers.Authorization = `Bearer ${params.token}`
    } else {
      delete config.headers.Authorization
    }

    if (params.accept) {
      config.headers['Content-Type'] = params.accept
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return rp(config)
  }
}
