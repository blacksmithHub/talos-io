const moment = require('moment')
const StopWatch = require('statman-stopwatch')
const UserAgent = require('user-agents')
const qs = require('qs')

const service = require('./service')

/**
 * Perform http request
 *
 * @param {*} options
 * @param {*} headers
 * @param {*} axios
 * @param {*} socket
 * @param {*} id
 */
async function http (options, headers, axios, socket, id) {
  const cancelTokenSource = axios.CancelToken.source()

  this.setAxiosCancelTokenSource(cancelTokenSource, socket, id)

  const currentTask = this.getCurrentTask(id)

  const requestHeaders = {
    ...options,
    headers: headers,
    withCredentials: true,
    cancelToken: cancelTokenSource.token
  }

  switch (currentTask.mode) {
    case 'Mobile (Android)':
    {
      const userAgentAnd = new UserAgent({ deviceCategory: 'mobile' })
      requestHeaders.headers['User-Agent'] = userAgentAnd.toString()
      requestHeaders.headers.client = 'android'
      break
    }

    case 'Mobile (iOS)':
    {
      const userAgentIos = new UserAgent({ deviceCategory: 'mobile' })
      requestHeaders.headers['User-Agent'] = userAgentIos.toString()
      requestHeaders.headers.client = 'ios'
      break
    }
    default:
    {
      const userAgent = new UserAgent()
      requestHeaders.headers['User-Agent'] = userAgent.toString()
      break
    }
  }

  if (currentTask.proxy && currentTask.proxy.proxies.length) {
    let proxy = null

    const pool = currentTask.proxy.proxies[Math.floor(Math.random() * currentTask.proxy.proxies.length)]

    proxy = {
      host: pool.host,
      port: pool.port
    }

    if (pool.username && pool.password) {
      proxy.auth = {
        username: pool.username,
        password: pool.password
      }
    }

    requestHeaders.proxy = proxy
  }

  return axios(requestHeaders)
    .then(({ data }) => data)
    .catch(async ({ response }) => {
      try {
        await this.updateCurrentTaskLog(socket, id, `Request failed - ${response.status}`)

        if (response.status === 401) {
          const token = await this.authenticate(axios, options.jar, socket, id)

          if (this.isRunning(id) && token) {
            const currentTask = this.getCurrentTask(id)

            currentTask.transactionData.token = token

            const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

            this.updateTask(callbackResponse)
          }
        } else if (response.status === 429) {
          return response
        }
      } catch (error) {
        //
      }
    })
}

/**
 * Set address object
 *
 * @param {*} address
 * @param {*} email
 */
function setAddresses (address, email) {
  return {
    region: address.region.region,
    region_id: address.region_id,
    region_code: address.region.region_code,
    country_id: address.country_id,
    street: address.street,
    postcode: address.postcode,
    city: address.city,
    firstname: address.firstname,
    lastname: address.lastname,
    email: email,
    telephone: address.telephone
  }
}

/**
 * Identify task status
 *
 * @param {*} id
 */
function isRunning (id) {
  const task = this.getCurrentTask(id)

  return task && task.status.id === this.service.status.running
}

/**
 * Return current task
 *
 * @param {*} id
 */
function getCurrentTask (id) {
  const task = this.service.tasks.find((data) => data.id === id)

  return task
}

/**
 * Set status of current task
 *
 * @param {*} id
 * @param {*} status
 * @param {*} msg
 * @param {*} attr
 * @param {*} socket
 */
function setCurrentTaskStatus (id, status, msg, attr, socket) {
  if (this.isRunning(id)) {
    const task = this.getCurrentTask(id)

    task.status = {
      id: status,
      msg: msg,
      class: attr
    }

    return new Promise((resolve) => (socket.emit('socket-response', task, (data) => (resolve(data)))))
  }
}

/**
 * Set axios cancel token to current task
 *
 * @param {*} cancelTokenSource
 * @param {*} socket
 * @param {*} id
 */
function setAxiosCancelTokenSource (cancelTokenSource, socket, id) {
  if (this.isRunning(id)) {
    const task = this.getCurrentTask(id)

    task.cancelTokenSource = cancelTokenSource

    return new Promise((resolve) => (socket.emit('socket-response', task, (data) => (resolve(data)))))
  }
}

/**
 * Update logs of current task
 *
 * @param {*} socket
 * @param {*} id
 * @param {*} msg
 */
function updateCurrentTaskLog (socket, id, msg) {
  if (this.isRunning(id)) {
    const task = this.getCurrentTask(id)

    task.logs = `${task.logs || ''};${msg}`

    return new Promise((resolve) => (socket.emit('socket-response', task, (data) => (resolve(data)))))
  }
}

/**
 * Remove task timer
 *
 * @param {*} id
 * @param {*} socket
 */
function removeTimer (id, socket) {
  if (this.isRunning(id)) {
    const task = this.getCurrentTask(id)

    task.placeOrder = null

    return new Promise((resolve) => (socket.emit('socket-response', task, (data) => (resolve(data)))))
  }
}

/**
 * Perform task update event
 *
 * @param {*} task
 */
function updateTask (task) {
  if (this.isRunning(task.id)) {
    const tasks = this.service.tasks
    const index = tasks.indexOf(this.getCurrentTask(task.id))

    tasks[index] = task

    this.service.tasks = tasks
  }
}

/**
 * Perform stop event
 *
 * @param {*} task
 */
function stop (task) {
  try {
    this.getCurrentTask(task.id).cancelTokenSource.cancel()
  } catch (error) {
    //
  }
}

/**
 * Perform verify automation
 *
 * @param {*} task
 * @param {*} socket
 */
async function verify (task, socket) {
  if (!this.isRunning(task.id)) return false

  const axios = require('axios').default
  const axiosCookieJarSupport = require('axios-cookiejar-support').default
  const tough = require('tough-cookie')

  axiosCookieJarSupport(axios)

  const cookieJar = new tough.CookieJar()

  /**
   * Step 1: authenticate
   *
   * get user token
   */
  let token = null

  if (this.isRunning(task.id)) {
    let currentTask = this.getCurrentTask(task.id)

    token = (!currentTask.transactionData.token)
      ? await this.authenticate(axios, cookieJar, socket, task.id, 'cyan')
      : currentTask.transactionData.token

    if (this.isRunning(task.id)) {
      currentTask = this.getCurrentTask(task.id)

      if (!token) {
        this.verify(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.token = token

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 2: get account
   *
   * get account data
   */
  let account = null

  if (this.isRunning(task.id)) {
    let currentTask = this.getCurrentTask(task.id)

    account = (!currentTask.transactionData.account)
      ? await this.getAccount(axios, cookieJar, socket, task.id)
      : currentTask.transactionData.account

    if (this.isRunning(task.id)) {
      currentTask = this.getCurrentTask(task.id)

      if (!account) {
        this.verify(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.account = account

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 3: initialize cart
   *
   * create, get, and clean cart
   */
  let cart = null

  let currentTask = this.getCurrentTask(task.id)

  if (this.isRunning(task.id)) {
    cart = (!currentTask.transactionData.cart)
      ? await this.initializeCart(axios, cookieJar, socket, task.id, 'cyan')
      : currentTask.transactionData.cart

    if (this.isRunning(task.id)) {
      currentTask = this.getCurrentTask(task.id)

      if (!cart) {
        this.verify(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.cart = cart

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  currentTask = this.getCurrentTask(task.id)

  socket.emit('socket-verified', currentTask)
}

/**
 * Perform start automation
 *
 * @param {*} task
 * @param {*} socket
 */
async function start (task, socket) {
  if (!this.isRunning(task.id)) return false

  const axios = require('axios').default
  const axiosCookieJarSupport = require('axios-cookiejar-support').default
  const tough = require('tough-cookie')

  axiosCookieJarSupport(axios)

  const cookieJar = new tough.CookieJar()

  /**
   * Step 1: authenticate
   *
   * get user token
   */
  let token = null

  if (this.isRunning(task.id)) {
    let currentTask = this.getCurrentTask(task.id)

    token = (!currentTask.transactionData.token)
      ? await this.authenticate(axios, cookieJar, socket, task.id)
      : currentTask.transactionData.token

    if (this.isRunning(task.id)) {
      currentTask = this.getCurrentTask(task.id)

      if (!token) {
        this.start(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.token = token

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 2: get account
   *
   * get account data
   */
  let account = null

  if (this.isRunning(task.id)) {
    let currentTask = this.getCurrentTask(task.id)

    account = (!currentTask.transactionData.account)
      ? await this.getAccount(axios, cookieJar, socket, task.id)
      : currentTask.transactionData.account

    if (this.isRunning(task.id)) {
      currentTask = this.getCurrentTask(task.id)

      if (!account) {
        this.start(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.account = account

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 3: initialize cart
   *
   * create, get, and clean cart
   */
  let cart = null

  if (this.isRunning(task.id)) {
    let currentTask = this.getCurrentTask(task.id)

    cart = (!currentTask.transactionData.cart)
      ? await this.initializeCart(axios, cookieJar, socket, task.id)
      : currentTask.transactionData.cart

    if (this.isRunning(task.id)) {
      currentTask = this.getCurrentTask(task.id)

      if (!cart) {
        this.start(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.cart = cart

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 4: add to cart
   *
   * add to cart
   */
  let product = null

  if (this.isRunning(task.id)) {
    product = await this.addToCart(axios, cookieJar, socket, task.id)

    if (this.isRunning(task.id)) {
      const currentTask = this.getCurrentTask(task.id)

      if (!product) {
        this.start(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.product = product

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 5: set shipping info
   *
   * set shipping details
   */
  let shipping = null

  const timer = new StopWatch(true)

  if (this.isRunning(task.id)) {
    shipping = await this.setShippingInfo(axios, cookieJar, socket, task.id)

    if (this.isRunning(task.id)) {
      const currentTask = this.getCurrentTask(task.id)

      if (!shipping) {
        this.start(currentTask, socket)
        return false
      } else {
        currentTask.transactionData.shipping = shipping

        const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

        this.updateTask(callbackResponse)
      }
    }
  }

  /**
   * Step 6: place order
   *
   * place order
   */
  let order = null

  if (this.isRunning(task.id)) {
    order = await this.placeOrder(axios, cookieJar, socket, task.id)

    timer.stop()

    const currentTask = this.getCurrentTask(task.id)
    const speed = (timer.read() / 1000.0).toFixed(2)

    currentTask.transactionData.timer = speed
    task.transactionData.timer = speed

    const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

    this.updateTask(callbackResponse)

    if (order) {
      await socket.emit('socket-success', currentTask)
    } else if (this.isRunning(task.id)) {
      await this.setCurrentTaskStatus(task.id, this.service.status.running, 'cleaning cart', 'orange', socket)

      const cart = await this.getCart(axios, cookieJar, socket, task.id)

      if (this.isRunning(task.id)) {
        let currentTask = this.getCurrentTask(task.id)

        if (cart) {
          currentTask.transactionData.cart = cart

          const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

          this.updateTask(callbackResponse)
        }

        currentTask = this.getCurrentTask(task.id)

        this.start(currentTask, socket)
      }
    }

    return false
  }
}

module.exports = {
  service,
  http,
  setAddresses,
  getCurrentTask,
  setCurrentTaskStatus,
  setAxiosCancelTokenSource,
  updateCurrentTaskLog,
  isRunning,
  updateTask,
  removeTimer,
  verify,
  start,
  stop,

  /**
   * Perform login
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async authenticate (axios, cookieJar, socket, id, attr = 'orange') {
    await this.setCurrentTaskStatus(id, this.service.status.running, 'authenticating', attr, socket)

    let data = null

    while (this.isRunning(id) && !data) {
      try {
        let currentTask = this.getCurrentTask(id)

        await new Promise(resolve => setTimeout(resolve, currentTask.delay))

        if (!this.isRunning(id)) break

        await this.updateCurrentTaskLog(socket, id, 'Logging in...')

        currentTask = this.getCurrentTask(id)

        const response = await this.http(
          {
            method: 'post',
            url: this.service.api.customer_login,
            data: { username: currentTask.profile.email, password: currentTask.profile.password },
            jar: cookieJar
          },
          { Accept: 'application/json' },
          axios, socket, id
        )

        if (!response.status && response) data = response
      } catch (error) {
        continue
      }
    }

    return data
  },

  /**
   * Fetch user account
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async getAccount (axios, cookieJar, socket, id) {
    let data = null

    while (this.isRunning(id) && !data) {
      try {
        let currentTask = this.getCurrentTask(id)

        await new Promise(resolve => setTimeout(resolve, currentTask.delay))

        if (!this.isRunning(id)) break

        await this.updateCurrentTaskLog(socket, id, 'Fetching account...')

        currentTask = this.getCurrentTask(id)

        const response = await this.http(
          {
            method: 'get',
            url: this.service.api.customer_account,
            jar: cookieJar
          },
          {
            Accept: 'application/json',
            Authorization: `Bearer ${currentTask.transactionData.token}`
          },
          axios, socket, id
        )

        if (response && response.addresses.length) data = response
      } catch (error) {
        continue
      }
    }

    return data
  },

  /**
   * Perform Create, get, and clean cart
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async initializeCart (axios, cookieJar, socket, id, attr = 'orange') {
    await this.setCurrentTaskStatus(id, this.service.status.running, 'initializing cart', attr, socket)

    const cartId = await this.createCart(axios, cookieJar, socket, id)

    let cart = null

    if (cartId) {
      cart = await this.getCart(axios, cookieJar, socket, id)
    }

    return cart
  },

  /**
   * Perform cart creation
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async createCart (axios, cookieJar, socket, id) {
    let data = null

    while (this.isRunning(id) && !data) {
      try {
        let currentTask = this.getCurrentTask(id)

        await new Promise(resolve => setTimeout(resolve, currentTask.delay))

        if (!this.isRunning(id)) break

        await this.updateCurrentTaskLog(socket, id, 'Creating cart...')

        currentTask = this.getCurrentTask(id)

        const response = await this.http(
          {
            method: 'post',
            url: this.service.api.cart,
            jar: cookieJar
          },
          {
            Accept: 'application/json',
            Authorization: `Bearer ${currentTask.transactionData.token}`
          },
          axios, socket, id
        )

        if (!response.status && response) data = response
      } catch (error) {
        continue
      }
    }

    return data
  },

  /**
   * Fetch and clean current cart
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async getCart (axios, cookieJar, socket, id) {
    let data = null

    while (this.isRunning(id) && !data) {
      try {
        let currentTask = this.getCurrentTask(id)

        await new Promise(resolve => setTimeout(resolve, currentTask.delay))

        if (!this.isRunning(id)) break

        await this.updateCurrentTaskLog(socket, id, 'Fetching cart...')

        currentTask = this.getCurrentTask(id)

        const response = await this.http(
          {
            method: 'get',
            url: this.service.api.cart,
            jar: cookieJar
          },
          {
            Accept: 'application/json',
            Authorization: `Bearer ${currentTask.transactionData.token}`
          },
          axios, socket, id
        )

        if (!response.status && response) data = response
      } catch (error) {
        continue
      }
    }

    // Clean cart
    if (this.isRunning(id) && data && data.items.length) {
      for (let index = 0; index < data.items.length; index++) {
        let deleted = false

        while (this.isRunning(id) && !deleted) {
          try {
            let currentTask = this.getCurrentTask(id)

            await new Promise(resolve => setTimeout(resolve, currentTask.delay))

            if (!this.isRunning(id)) break

            await this.updateCurrentTaskLog(socket, id, `Cleaning cart - item ${index + 1}...`)

            currentTask = this.getCurrentTask(id)

            const response = await this.http(
              {
                method: 'delete',
                url: `${this.service.api.delete_cart}/${data.items[index].item_id}`,
                jar: cookieJar
              },
              {
                Accept: 'application/json',
                Authorization: `Bearer ${currentTask.transactionData.token}`
              },
              axios, socket, id
            )

            if (!response.status && response) deleted = response
          } catch (error) {
            continue
          }
        }
      }
    }

    return data
  },

  /**
   * Add product to cart
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async addToCart (axios, cookieJar, socket, id) {
    let data = null

    while (this.isRunning(id) && !data) {
      try {
        let currentTask = this.getCurrentTask(id)

        for (let index = 0; index < currentTask.sizes.length; index++) {
          try {
            await new Promise(resolve => setTimeout(resolve, currentTask.delay))

            if (!this.isRunning(id)) break

            const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - trying`
            await this.setCurrentTaskStatus(id, this.service.status.running, msg, 'orange', socket)
            await this.updateCurrentTaskLog(socket, id, msg)

            currentTask = this.getCurrentTask(id)

            const payload = {
              cartItem: {
                sku: `${currentTask.sku}-SZ${currentTask.sizes[index].label.replace('.', 'P').toUpperCase()}`,
                qty: currentTask.qty || 1,
                quote_id: currentTask.transactionData.cart.id.toString(),
                product_option: {
                  extension_attributes: {
                    configurable_item_options: [
                      {
                        option_id: currentTask.sizes[index].attribute_id.toString(),
                        option_value: parseInt(currentTask.sizes[index].value)
                      }
                    ]
                  }
                },
                product_type: 'configurable'
              }
            }

            const response = await this.http(
              {
                method: 'post',
                url: this.service.api.add_to_cart,
                jar: cookieJar,
                data: payload
              },
              {
                Accept: 'application/json',
                Authorization: `Bearer ${currentTask.transactionData.token}`
              },
              axios, socket, id
            )

            if (!this.isRunning(id)) break

            if (!response.status && response) {
              data = response
              data.size = currentTask.sizes[index].label.toUpperCase()

              const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - carted`
              await this.setCurrentTaskStatus(id, this.service.status.running, msg, 'orange', socket)
              await this.updateCurrentTaskLog(socket, id, msg)

              break
            }
          } catch (error) {
            continue
          }
        }
      } catch (error) {
        continue
      }
    }

    return data
  },

  /**
   * Perform setting of shipping information
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async setShippingInfo (axios, cookieJar, socket, id) {
    let data = null

    let currentTask = this.getCurrentTask(id)

    const defaultShippingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_shipping)
    const defaultBillingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_billing)

    // estimate shipping
    let params = null

    if (currentTask.transactionData.product.price <= 7000) {
      while (this.isRunning(id) && !params) {
        try {
          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          if (!this.isRunning(id)) break

          await this.updateCurrentTaskLog(socket, id, 'Estimate shipping...')
          await this.setCurrentTaskStatus(id, this.service.status.running, 'estimate shipping', 'orange', socket)

          currentTask = this.getCurrentTask(id)

          const payload = { addressId: defaultShippingAddress.id }

          const response = await this.http(
            {
              method: 'post',
              url: this.service.api.estimate_shipping,
              data: payload,
              jar: cookieJar
            },
            {
              Accept: 'application/json',
              Authorization: `Bearer ${currentTask.transactionData.token}`
            },
            axios, socket, id
          )

          if (!response.status && response) params = response[0]
        } catch (error) {
          continue
        }
      }
    } else {
      params = {
        carrier_code: 'freeshipping',
        method_code: 'freeshipping'
      }
    }

    if (!this.isRunning(id)) return data

    // set shipping
    await this.updateCurrentTaskLog(socket, id, 'setting shipping details...')
    await this.setCurrentTaskStatus(id, this.service.status.running, 'setting shipping details', 'orange', socket)

    currentTask = this.getCurrentTask(id)

    const shippingAddress = this.setAddresses(defaultShippingAddress, currentTask.transactionData.account.email)
    const billingAddress = this.setAddresses(defaultBillingAddress, currentTask.transactionData.account.email)

    const payload = {
      addressInformation: {
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_carrier_code: params.carrier_code,
        shipping_method_code: params.method_code
      }
    }

    while (this.isRunning(id) && !data) {
      try {
        await new Promise(resolve => setTimeout(resolve, currentTask.delay))

        if (!this.isRunning(id)) break

        currentTask = this.getCurrentTask(id)

        const response = await this.http(
          {
            method: 'post',
            url: this.service.api.set_shipping,
            data: payload,
            jar: cookieJar
          },
          {
            Accept: 'application/json',
            Authorization: `Bearer ${currentTask.transactionData.token}`
          },
          axios, socket, id
        )

        if (!response.status && response) data = response
      } catch (error) {
        continue
      }
    }

    return data
  },

  /**
   * Perform placing of order
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async placeOrder (axios, cookieJar, socket, id) {
    let data = null

    let currentTask = this.getCurrentTask(id)

    const waitingMsg = `Size: ${currentTask.transactionData.product.size} - waiting to place order`
    await this.updateCurrentTaskLog(socket, id, waitingMsg)
    await this.setCurrentTaskStatus(id, this.service.status.running, waitingMsg, 'orange', socket)

    currentTask = this.getCurrentTask(id)

    if (!this.isRunning(id)) return data

    await new Promise((resolve) => {
      const vm = this

      const loop = setInterval(function () {
        if (!vm.isRunning(id)) {
          clearInterval(loop)
          resolve()
        } else {
          currentTask = vm.getCurrentTask(id)

          if (currentTask.placeOrder) {
            const timer = moment(currentTask.placeOrder, 'HH:mm:ss').format('HH:mm:ss')
            const current = moment().format('HH:mm:ss')

            if (current >= timer) {
              vm.removeTimer(id, socket)
              clearInterval(loop)
              resolve()
            }
          } else {
            clearInterval(loop)
            resolve()
          }
        }
      }, 1000)
    })

    if (!this.isRunning(id)) return data

    currentTask = this.getCurrentTask(id)

    const placingMsg = `Size: ${currentTask.transactionData.product.size} - placing order`
    await this.updateCurrentTaskLog(socket, id, placingMsg)
    await this.setCurrentTaskStatus(id, this.service.status.running, placingMsg, 'orange', socket)

    currentTask = this.getCurrentTask(id)

    const defaultBillingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_billing)

    const payload = {
      amcheckout: {},
      billingAddress: this.setAddresses(defaultBillingAddress, currentTask.transactionData.account.email),
      cartId: currentTask.transactionData.cart.id.toString(),
      paymentMethod: {
        additional_data: null,
        method: '',
        po_number: null
      }
    }

    switch (currentTask.transactionData.shipping.payment_methods.slice().find((val) => val.code).code) {
      case 'paymaya_checkout':
        payload.paymentMethod.method = 'paymaya_checkout'
        data = await this.paymayaCheckout(axios, cookieJar, socket, id, payload)
        break

      case 'ccpp':
        payload.paymentMethod.method = 'ccpp'
        data = await this.creditCardCheckout(axios, cookieJar, socket, id, payload)
        break

      case 'braintree_paypal':
        payload.paymentMethod.method = 'braintree_paypal'

        currentTask = this.getCurrentTask(id)

        if (currentTask.profile.paypal && Object.keys(currentTask.profile.paypal).length) {
          payload.paymentMethod.additional_data = {
            paypal_express_checkout_token: currentTask.profile.paypal.paypalAccounts[0].details.correlationId,
            paypal_express_checkout_redirect_required: false,
            paypal_express_checkout_payer_id: currentTask.profile.paypal.paypalAccounts[0].details.payerInfo.payerId,
            payment_method_nonce: currentTask.profile.paypal.paypalAccounts[0].nonce
          }
        } else if (this.service.paypal && Object.keys(this.service.paypal).length) {
          payload.paymentMethod.additional_data = {
            paypal_express_checkout_token: this.service.paypal.paypalAccounts[0].details.correlationId,
            paypal_express_checkout_redirect_required: false,
            paypal_express_checkout_payer_id: this.service.paypal.paypalAccounts[0].details.payerInfo.payerId,
            payment_method_nonce: this.service.paypal.paypalAccounts[0].nonce
          }
        }

        data = await this.paypalCheckout(axios, cookieJar, socket, id, payload)

        break
    }

    return data
  },

  /**
   * PayMaya checkout method
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   * @param {*} payload
   */
  async paymayaCheckout (axios, cookieJar, socket, id, payload) {
    let data = null

    const tries = 3

    let currentTask = this.getCurrentTask(id)

    for (let index = 1; index <= tries; index++) {
      if (!this.isRunning(id)) break

      try {
        currentTask = this.getCurrentTask(id)

        if (index > 1) {
          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - trying for restock`

          await this.updateCurrentTaskLog(socket, id, waitingMsg)
          await this.setCurrentTaskStatus(id, this.service.status.running, waitingMsg, 'orange', socket)
        }

        while (this.isRunning(id) && !data) {
          currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          currentTask = this.getCurrentTask(id)

          const response = await this.http(
            {
              method: 'post',
              url: this.service.api.place_order,
              jar: cookieJar,
              data: payload
            },
            {
              Accept: 'application/json',
              Authorization: `Bearer ${currentTask.transactionData.token}`
            },
            axios, socket, id
          )

          if (response.status && response.status !== 429) break

          if (!response.status && response) {
            const paymaya = await this.http(
              {
                method: 'get',
                url: this.service.api.paymaya,
                jar: cookieJar
              },
              { Accept: 'application/json' },
              axios, socket, id
            )

            if (!paymaya.status && paymaya) data = paymaya.request.uri.href

            break
          }
        }

        if (data) break
      } catch (error) {
        continue
      }
    }

    if (!this.isRunning(id)) return null

    currentTask = this.getCurrentTask(id)

    if (!data) {
      const msg = `Size: ${currentTask.transactionData.product.size} - out of stock`

      await this.updateCurrentTaskLog(socket, id, msg)
      await this.setCurrentTaskStatus(id, this.service.status.running, msg, 'orange', socket)
    } else {
      const msg = `Size: ${currentTask.transactionData.product.size} - copped!`

      currentTask.transactionData.checkoutLink = data
      currentTask.transactionData.method = 'PayMaya'
      currentTask.logs = `${currentTask.logs || ''};${msg}`
      currentTask.status = {
        id: this.service.status.stopped,
        msg: msg,
        class: 'success'
      }
      currentTask.transactionData.product.image = await this.searchProduct(axios, cookieJar, socket, id)

      const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

      this.updateTask(callbackResponse)
    }

    return data
  },

  /**
   * 2c2p checkout method
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   * @param {*} payload
   */
  async creditCardCheckout (axios, cookieJar, socket, id, payload) {
    let data = null

    const tries = 3

    let currentTask = this.getCurrentTask(id)

    for (let index = 1; index <= tries; index++) {
      if (!this.isRunning(id)) break

      try {
        currentTask = this.getCurrentTask(id)

        if (index > 1) {
          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - trying for restock`

          await this.updateCurrentTaskLog(socket, id, waitingMsg)
          await this.setCurrentTaskStatus(id, this.service.status.running, waitingMsg, 'orange', socket)
        }

        while (this.isRunning(id) && !data) {
          currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          currentTask = this.getCurrentTask(id)

          const placeOrderResponse = await this.http(
            {
              method: 'post',
              url: this.service.api.place_order,
              jar: cookieJar,
              data: payload
            },
            {
              Accept: 'application/json',
              Authorization: `Bearer ${currentTask.transactionData.token}`
            },
            axios, socket, id
          )

          if (!this.isRunning(id) || (placeOrderResponse.status && placeOrderResponse.status !== 429)) break

          if (!placeOrderResponse.status && placeOrderResponse) {
            const getTransactionResponse = await this.http(
              {
                method: 'get',
                url: this.service.api.get_transaction,
                jar: cookieJar
              },
              { Accept: 'application/json' },
              axios, socket, id
            )

            if (!this.isRunning(id) || (getTransactionResponse.status && getTransactionResponse.status !== 429)) break

            if (!getTransactionResponse.status && getTransactionResponse) {
              const payload = new URLSearchParams()
              let orderNumber = null

              for (let i = 0; i < getTransactionResponse.fields.length; i++) {
                payload.append(getTransactionResponse.fields[i], getTransactionResponse.values[i])

                if (getTransactionResponse.fields[i] === 'order_id') orderNumber = getTransactionResponse.values[i]
              }

              data = orderNumber

              await this.http(
                {
                  method: 'post',
                  url: this.service.api.credit_card_checkout,
                  jar: cookieJar,
                  data: payload
                },
                { Accept: 'application/x-www-form-urlencoded' },
                axios, socket, id
              )

              break
            }
          }
        }

        if (data) break
      } catch (error) {
        continue
      }
    }

    if (!this.isRunning(id)) return null

    currentTask = this.getCurrentTask(id)

    if (!data) {
      const msg = `Size: ${currentTask.transactionData.product.size} - out of stock`

      await this.updateCurrentTaskLog(socket, id, msg)
      await this.setCurrentTaskStatus(id, this.service.status.running, msg, 'orange', socket)
    } else {
      const msg = `Size: ${currentTask.transactionData.product.size} - copped!`

      currentTask.transactionData.cookie = cookieJar.store.idx['2c2p.com']['/']['ASP.NET_SessionId']
      currentTask.transactionData.method = '2c2p'
      currentTask.logs = `${currentTask.logs || ''};${msg}`
      currentTask.status = {
        id: this.service.status.stopped,
        msg: msg,
        class: 'success'
      }
      currentTask.transactionData.order = data
      currentTask.transactionData.product.image = await this.searchProduct(axios, cookieJar, socket, id)

      const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

      this.updateTask(callbackResponse)
    }

    return data
  },

  /**
   * PayPal checkout method
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   * @param {*} payload
   */
  async paypalCheckout (axios, cookieJar, socket, id, payload) {
    let data = null

    const tries = 3

    let currentTask = this.getCurrentTask(id)

    for (let index = 1; index <= tries; index++) {
      if (!this.isRunning(id)) break

      try {
        currentTask = this.getCurrentTask(id)

        if (index > 1) {
          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - trying for restock`

          await this.updateCurrentTaskLog(socket, id, waitingMsg)
          await this.setCurrentTaskStatus(id, this.service.status.running, waitingMsg, 'orange', socket)
        }

        while (this.isRunning(id) && !data) {
          currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          currentTask = this.getCurrentTask(id)

          const response = await this.http(
            {
              method: 'post',
              url: this.service.api.place_order,
              jar: cookieJar,
              data: payload
            },
            {
              Accept: 'application/json',
              Authorization: `Bearer ${currentTask.transactionData.token}`
            },
            axios, socket, id
          )

          if (!response.status && response) data = response
        }
      } catch (error) {
        continue
      }
    }

    if (!this.isRunning(id)) return null

    currentTask = this.getCurrentTask(id)

    if (!data) {
      const msg = `Size: ${currentTask.transactionData.product.size} - out of stock`

      await this.updateCurrentTaskLog(socket, id, msg)
      await this.setCurrentTaskStatus(id, this.service.status.running, msg, 'orange', socket)
    } else {
      const msg = `Size: ${currentTask.transactionData.product.size} - copped!`

      currentTask.transactionData.method = 'PayPal'
      currentTask.logs = `${currentTask.logs || ''};${msg}`
      currentTask.status = {
        id: this.service.status.stopped,
        msg: msg,
        class: 'success'
      }
      currentTask.transactionData.product.image = await this.searchProduct(axios, cookieJar, socket, id)

      const callbackResponse = await new Promise((resolve) => (socket.emit('socket-response', currentTask, (data) => (resolve(data)))))

      this.updateTask(callbackResponse)
    }

    return data
  },

  /**
   * Perform product search
   *
   * @param {*} axios
   * @param {*} cookieJar
   * @param {*} socket
   * @param {*} id
   */
  async searchProduct (axios, cookieJar, socket, id) {
    let data = null

    const currentTask = this.getCurrentTask(id)

    const params = {
      searchCriteria: {
        filterGroups: [
          {
            filters: [
              {
                field: 'sku',
                value: currentTask.sku.toUpperCase()
              }
            ]
          }
        ]
      }
    }

    const query = qs.stringify(params)

    const response = await this.http(
      {
        method: 'get',
        url: `${this.service.api.search_product}?${query}`,
        jar: cookieJar
      },
      {
        Accept: 'application/json',
        Authorization: `Bearer ${this.service.token}`
      },
      axios, socket, id
    )

    try {
      const image = response.items[0].custom_attributes.find((val) => val.attribute_code === 'image')
      data = `${this.service.site}/media/catalog/product${image.value}`
    } catch (error) {
      data = ''
    }

    return data
  }
}
