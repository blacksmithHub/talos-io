import Url from 'url-parse'
import store from '@/store/index'

export default {
  async http (params) {
    const rp = params.config.rp
    const url = new Url(params.url)

    let options = {
      url: params.url,
      method: params.method,
      headers: {
        'User-Agent': params.config.userAgent,
        referer: `${url.protocol}//${url.host}/`
      },
      jar: params.config.jar
    }

    // Set request options
    if (params.config.options) {
      options = {
        ...params.config.options,
        ...options,
        jar: params.config.options.jar,
        headers: {
          ...params.config.options.headers,
          'User-Agent': params.config.userAgent,
          referer: `${url.protocol}//${url.host}/`
        }
      }
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

    // Set access token
    if (params.token) {
      options.headers.Authorization = `Bearer ${params.token}`
    } else {
      delete options.headers.Authorization
    }

    // Set content type
    if (params.accept) {
      options.headers['Content-Type'] = params.accept
    } else {
      options.headers['Content-Type'] = 'application/json'
    }

    // Set device mode
    if (params.mode) options.headers.client = params.mode.name

    const request = rp(options)

    if (params.taskId) {
      const vuex = store._modules.root._children.task.context

      const task = vuex.state.items.find((val) => val.id === params.taskId)

      task.proxy.configs = task.proxy.configs.map((el) => {
        if (el.proxy === options.proxy) el.request = request

        return el
      })

      vuex.dispatch('updateItem', task)
    }

    return request
  }
}
