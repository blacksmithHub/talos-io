import store from '@/store/index'
import Config from '@/config/app'

export default {
  async http (params) {
    const rp = params.config.rp
    let headers = { Accept: params.accept ? params.accept : 'application/json' }

    // Set access token
    if (params.token) {
      headers.Authorization = `Bearer ${params.token}`
    }

    // Set device mode
    if (params.mode) headers.Client = params.mode.name

    const url = new URL(params.url)

    headers = {
      ...headers,
      Connection: 'keep-alive',
      'Content-Type': params.accept ? params.accept : 'application/json',
      Host: url.host,
      Origin: url.origin,
      Referer: url.origin,
      'User-Agent': params.config.userAgent
    }

    let options = {
      url: params.url,
      method: params.method,
      headers,
      jar: params.config.jar
    }

    // Set request options
    if (params.config.options) {
      options = {
        ...params.config.options,
        ...options,
        headers: {
          ...params.config.options.headers,
          ...headers,
          'User-Agent': params.config.userAgent
        },
        jar: params.config.options.jar
      }
    }

    // Set TLS version
    if (url.origin === Config.services.titan22.url) {
      options.secureProtocol = 'TLSv1_2_method'
    } else {
      delete options.secureProtocol
    }

    // Remove access token if not needed
    if (!params.token) {
      delete options.headers.Authorization
    }

    // Set proxy
    if (params.config.proxy) options.proxy = params.config.proxy

    // Set payload
    if (params.payload) {
      options.body = JSON.stringify(params.payload)
    } else {
      delete options.body
    }

    // Set form data
    if (params.form) {
      options.form = params.form
    } else {
      delete options.form
    }

    const request = rp(options)

    if (params.taskId) {
      const vuex = store._modules.root._children.task.context

      const items = vuex.state.items.slice()

      const task = items.find((val) => val.id === params.taskId)

      if (task) {
        const confs = task.proxy.configs.slice()

        task.proxy.configs = confs.map((el) => {
          if (el.proxy === options.proxy) el.request = request

          return el
        })

        vuex.dispatch('updateItem', task)
      }
    } else if (params.proxyId) {
      const vuex = store._modules.root._children.proxy.context

      const items = vuex.state.items.slice()

      const proxy = items.find((val) => val.id === params.proxyId)

      if (proxy) {
        const conf = proxy.configs.slice()

        proxy.configs = conf.map((el) => {
          if (el.proxy === params.config.proxy) el.request = request

          return el
        })

        vuex.dispatch('updateItem', proxy)
      }
    }

    return request
  }
}
