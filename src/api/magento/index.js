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
    let rp = null
    let proxy = 'local'
    let host = 'local'
    const url = new Url(params.url)

    let options = {
      url: params.url,
      method: params.method,
      headers: {
        referer: `${url.protocol}//${url.host}/`
      }
    }

    if (params.proxy && Object.keys(params.proxy).length && params.proxy.proxies.length) {
      let index = 0

      if (params.proxy.proxies.length > 1) index = Math.floor(Math.random() * params.proxy.proxies.length)

      const selected = params.proxy.proxies[index]

      host = selected.host

      if (selected.username && selected.password) {
        proxy = `http://${selected.username}:${selected.password}@${selected.host}:${selected.port}`
      } else {
        proxy = `http://${selected.host}:${selected.port}`
      }
    }

    const config = params.configs.find((el) => el.host === host)

    if (config) {
      rp = config.rp

      options.headers['User-Agent'] = config.userAgent
      options.jar = config.jar

      if (config.options) {
        options = {
          ...config.options,
          ...options,
          headers: {
            ...config.options.headers,
            'User-Agent': config.userAgent,
            referer: `${url.protocol}//${url.host}/`
          },
          jar: config.options.jar
        }
      }

      if (proxy !== 'local') options.proxy = proxy
    }

    if (params.payload) {
      options.body = JSON.stringify(params.payload)
    } else {
      delete options.body
    }

    if (params.form) {
      options.form = params.form
    } else {
      delete options.form
    }

    if (params.token) {
      options.headers.Authorization = `Bearer ${params.token}`
    } else {
      delete options.headers.Authorization
    }

    if (params.accept) {
      options.headers['Content-Type'] = params.accept
    } else {
      options.headers['Content-Type'] = 'application/json'
    }

    if (params.mode && params.mode.id !== 1) {
      options.headers.client = params.mode.name
    }

    const request = rp(options)

    if (params.taskId) {
      const vuex = store._modules.root._children.task.context

      const task = vuex.state.items.find((val) => val.id === params.taskId)

      task.configs = task.configs.map((el) => {
        if (el.proxy === proxy) {
          el.request = request
        }

        return el
      })

      vuex.dispatch('updateItem', task)
    }

    return request
  }
}
