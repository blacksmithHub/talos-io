import { Howl } from 'howler'
import { Cookie } from 'tough-cookie'
import SuccessEffect from '@/assets/success.mp3'

import StopWatch from 'statman-stopwatch'
import moment from 'moment-timezone'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import orderApi from '@/api/magento/titan22/order'
import productApi from '@/api/magento/titan22/product'

import Constant from '@/config/constant'
import Config from '@/config/app'
import store from '@/store/index'
import Bot from '@/services/task'
import Webhook from '@/services/webhook'
import CF from '@/services/cloudflare-bypass'
import CreditCardCheckout from '@/services/Titan22/CreditCardCheckout'
import PayMayaCheckout from '@/services/Titan22/PayMayaCheckout'

const Tasks = store._modules.root._children.task.context
const Settings = store._modules.root._children.settings.context
const Accounts = store._modules.root._children.account.context

/**
 * ===============================================
 * Automate service
 * ===============================================
 *
 * Provides automation actions
 *
 * ===============================================
 */
export default {
  /**
   * Remove task timer
   *
   * @param {*} id
   */
  async removeTimer (id) {
    const task = await Bot.getCurrentTask(id)

    if (task) {
      task.placeOrder = null

      Tasks.dispatch('updateItem', task)
    }
  },

  /**
   * Set address object
   *
   * @param {*} address
   * @param {*} email
   */
  setAddresses (address, email) {
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
  },

  /**
   * Check if token is expired
   *
   * @param {*} id
   */
  async checkTokenExpiration (id) {
    let currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (moment().isSameOrAfter(moment(currentTask.transactionData.token.expires_in))) {
      const token = await this.authenticate(id)
      currentTask = await Bot.getCurrentTask(id)

      if (Bot.isRunning(id) && token && Object.keys(token).length && currentTask) {
        currentTask.transactionData.token = token
        Tasks.dispatch('updateItem', currentTask)
      }
    }
  },

  /**
   * Assign config
   *
   * @param {*} proxy
   */
  getConfig (proxy) {
    let index = 0

    if (proxy.configs.length > 1) index = Math.floor(Math.random() * proxy.configs.length)

    return proxy.configs[index]
  },

  /**
   * Handle API error responses
   *
   * https://support.cloudflare.com/hc/en-us/articles/115003014512-4xx-Client-Error
   * https://support.cloudflare.com/hc/en-us/articles/115003011431/
   *
   * @param {*} id
   * @param {*} counter
   * @param {*} response
   * @param {*} attr
   */
  async handleError (id, counter, response, attr = 'orange') {
    try {
      try {
        /**
         * send logs
         */
        switch (response.statusCode) {
          case 403:
          case 503:
          {
            if (response.message) {
              if (response.message.includes('cf-browser-verification')) {
                // 5 seconds challege
                await Bot.updateCurrentTaskLog(id, `#${counter} at Line 133: cf-browser-verification`)
              } else if (response.message.includes('cf_captcha_kind')) {
                // captcha challenge
                await Bot.updateCurrentTaskLog(id, `#${counter} at Line 136: cf_captcha_kind`)
              } else {
                await Bot.updateCurrentTaskLog(id, `#${counter} at Line 138: ${response.message}`)
              }
            } else {
              await Bot.updateCurrentTaskLog(id, `#${counter} at Line 141: ${response}`)
            }
            break
          }

          case 502:
          case 504:
          {
            if (response.message) {
              if (response.message.includes('502 Bad Gateway')) {
                await Bot.updateCurrentTaskLog(id, `#${counter} at Line 151: 502 - Bad Gateway`)
              }
            }
            break
          }

          default:
          {
            if (response.message) {
              await Bot.updateCurrentTaskLog(id, `#${counter} at Line 160: ${response.message}`)
            } else {
              await Bot.updateCurrentTaskLog(id, `#${counter} at Line 162: ${response}`)
            }

            break
          }
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 169: ${error}`)
      }

      /**
       * send statuses
       */
      switch (response.statusCode) {
        case 400:
        {
          if (response.message) {
            if (response.message.includes('Sorry, you cannot purchase at the moment')) {
              // Need to update account
              const currentTask = await Bot.getCurrentTask(id)
              if (!currentTask || !Bot.isRunning(id)) break

              await this.updateAccount(id, attr, currentTask.transactionData.account)
              break
            } else if (response.message.includes('This product is out of stock') || response.message.includes('The requested qty is not available')) {
              // Product out of stock
              await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'out of stock', attr: 'red' })
              break
            } else if (response.message.includes('Product that you are trying to add is not available')) {
              // Product not available
              await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'product not available', attr: 'red' })
              break
            }
          }

          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Request Not Available', attr: 'red' })
          break
        }

        case 404:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Request Not Found', attr: 'red' })
          break

        case 429:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Too many requests', attr: 'red' })
          break

        case 500:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Internal server error', attr: 'red' })
          break

        case 502:
        case 504:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Bad Gateway', attr: 'red' })
          break

        case 520:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'unknown error', attr: 'red' })
          break

        case 521:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'web server is down', attr: 'red' })
          break

        case 522:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'connection timed out', attr: 'red' })
          break

        case 523:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'origin is unreachable', attr: 'red' })
          break

        case 524:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'timeout occurred', attr: 'red' })
          break

        case 525:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'SSL handshake failed', attr: 'red' })
          break

        case 526:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'invalid SSL certificate', attr: 'red' })
          break

        case 401:
        {
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Unauthorized', attr: 'red' })

          let currentTask = await Bot.getCurrentTask(id)
          if (!currentTask || !Bot.isRunning(id)) break

          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)

          if (!Bot.isRunning(id)) break

          const token = await this.authenticate(id, attr)
          currentTask = await Bot.getCurrentTask(id)

          if (Bot.isRunning(id) && token && Object.keys(token).length && currentTask) {
            currentTask.transactionData.token = token
            Tasks.dispatch('updateItem', currentTask)
          }

          break
        }

        case 403:
        case 503:
        {
          switch (response.statusCode) {
            case 403:
              await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Forbidden', attr: 'red' })
              break

            case 503:
              await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'service temporarily unavailable', attr: 'red' })
              break
          }

          const { options } = response
          const { jar } = options

          const cookies = await CF.bypass(options, id, 'TASK')

          const currentTask = await Bot.getCurrentTask(id)

          if (cookies.length) {
            for (const cookie of cookies) {
              const { name, value, expires, domain, path } = cookie

              const expiresDate = new Date(expires * 1000)

              const val = new Cookie({
                key: name,
                value,
                expires: expiresDate,
                domain: domain.startsWith('.') ? domain.substring(1) : domain,
                path
              }).toString()

              jar.setCookie(val, Config.services.titan22.url)
            }

            let configs = currentTask.proxy.configs.slice()

            configs = await configs.map((el) => {
              if (el.proxy === options.proxy) el.options = options

              return el
            })

            currentTask.proxy.configs = configs

            Tasks.state.items.forEach((el) => {
              if (el.id !== id && el.proxy.id === currentTask.proxy.id) {
                Tasks.dispatch('updateItem', {
                  ...el,
                  proxy: {
                    ...el.proxy,
                    configs: configs
                  }
                })
              }
            })
          }

          Tasks.dispatch('updateItem', { ...currentTask })

          break
        }

        default:
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'error', attr: 'red' })
          break
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `#${counter} at Line 348: ${error}`)
    }
  },

  /**
   * Perform verify automation
   *
   * @param {*} id
   */
  async verify (id) {
    let currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 1: authenticate
     *
     * get user token
     */
    const token = await this.authenticate(id, 'cyan')

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (token && Object.keys(token).length) {
      currentTask.transactionData.token = token
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.verify(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id)) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id)) return false

    /**
     * Step 2: get account
     *
     * get account data
     */
    const account = await this.prepareAccount(id, 'cyan')

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (account && Object.keys(account).length) {
      currentTask.transactionData.account = account
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.verify(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id)) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id)) return false

    /**
     * Step 3: initialize cart
     *
     * create, get, and clean cart
     */
    const cart = await this.initializeCart(id, 'cyan')

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (cart && cart.id) {
      currentTask.transactionData.cart = cart
      await Tasks.dispatch('updateItem', currentTask)
      await Bot.updateCurrentTaskLog(id, 'Ready!')
      await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.STOPPED, msg: 'ready', attr: 'light-blue' })
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.verify(id)
    }

    return false
  },

  /**
   * Perform start automation
   *
   * @param {*} id
   */
  async start (id) {
    let currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 1: authenticate
     *
     * get user token
     */
    let token = null

    if (currentTask.transactionData.token) {
      token = currentTask.transactionData.token
    } else {
      token = await this.authenticate(id)
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (token && Object.keys(token).length) {
      currentTask.transactionData.token = token
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.start(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 2: get account
     *
     * get account data
     */
    let account = null

    if (currentTask.transactionData.account && Object.keys(currentTask.transactionData.account).length) {
      account = currentTask.transactionData.account
    } else {
      account = await this.prepareAccount(id)
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (account && Object.keys(account).length) {
      currentTask.transactionData.account = account
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.start(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 3: initialize cart
     *
     * create, get, and clean cart
     */
    let cart = null

    if (currentTask.transactionData.cart && currentTask.transactionData.cart.id) {
      cart = currentTask.transactionData.cart
    } else {
      cart = await this.initializeCart(id)
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (cart && cart.id) {
      currentTask.transactionData.cart = cart
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.start(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 4: add to cart
     *
     * add to cart
     */
    const product = await this.addToCart(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (product && Object.keys(product).length) {
      currentTask.transactionData.product = product
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.start(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 5: set shipping info
     *
     * set shipping details
     */
    const shipping = await this.setShippingInfo(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (shipping && Object.keys(shipping).length) {
      currentTask.transactionData.shipping = shipping
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.start(id)
      return false
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    await this.checkTokenExpiration(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    /**
     * Step 6: place order
     *
     * place order
     */
    const order = await this.placeOrder(id)

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    if (order) {
      await this.onSuccess(id)
      return false
    } else {
      delete currentTask.transactionData.cart

      await Tasks.dispatch('updateItem', currentTask)

      await new Promise(resolve => setTimeout(resolve, 1000))
      this.start(id)
    }

    return false
  },

  /**
   * Perform login
   *
   * @param {*} id
   */
  async authenticate (id, attr = 'orange') {
    let data = null
    let counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        let currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'authenticating', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Logging in...`)

        const params = {
          payload: {
            username: currentTask.account.email,
            password: currentTask.account.password
          },
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await authApi.fetchToken(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
        } else if (response && !response.error) {
          data = {
            token: JSON.parse(response),
            expires_in: moment().add(50, 'minutes').toISOString()
          }

          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 686: ${error}`)
      }
    }

    return data
  },

  /**
   * Prepare user account
   *
   * @param {*} id
   * @param {*} attr
   * @returns
   */
  async prepareAccount (id, attr = 'orange') {
    const account = await this.getAccount(id, attr)

    await this.updateAccount(id, attr, account)

    return account
  },

  /**
   * Fetch user account
   *
   * @param {*} id
   */
  async getAccount (id, attr = 'orange') {
    let data = null
    let counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        let currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        await Bot.updateCurrentTaskLog(id, `#${counter}: Fetching account...`)

        const params = {
          token: currentTask.transactionData.token.token,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await customerApi.getProfile(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
        } else if (response && !response.error && JSON.parse(response) && JSON.parse(response).addresses.length) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 764: ${error}`)
      }
    }

    return data
  },

  /**
   * Update user account
   *
   * @param {*} id
   * @param {*} attr
   * @returns
   */
  async updateAccount (id, attr = 'orange', account) {
    let data = null
    let counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        let currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        await Bot.updateCurrentTaskLog(id, `#${counter}: Updating account...`)

        const params = {
          token: currentTask.transactionData.token.token,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id,
          payload: { customer: account }
        }

        if (!Bot.isRunning(id)) break

        const response = await customerApi.updateProfile(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
        } else if (response && !response.error && JSON.parse(response) && JSON.parse(response).addresses.length) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 830: ${error}`)
      }
    }

    return data
  },

  /**
   * Perform Create, get, and clean cart
   *
   * @param {*} id
   */
  async initializeCart (id, attr = 'orange') {
    const cartId = await this.createCart(id, attr)

    let cart = null

    if (cartId) cart = await this.getCart(id, attr)

    return cart
  },

  /**
   * Perform cart creation
   *
   * @param {*} id
   */
  async createCart (id, attr = 'orange') {
    let data = null
    let counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        let currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'initializing cart', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Creating cart...`)

        const params = {
          token: currentTask.transactionData.token.token,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.create(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 909: ${error}`)
      }
    }

    return data
  },

  /**
   * Fetch and clean current cart
   *
   * @param {*} id
   */
  async getCart (id, attr = 'orange') {
    let data = null
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    while (Bot.isRunning(id) && currentTask && !data) {
      counter++

      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'initializing cart', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Getting cart...`)

        const params = {
          token: currentTask.transactionData.token.token,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.get(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 974: ${error}`)
      }
    }

    if (!Bot.isRunning(id)) return null

    // Clean cart
    if (data && data.items.length) {
      for (let index = 0; index < data.items.length; index++) {
        await this.deleteToCart(id, data.items[index], attr)
      }
    }

    return data
  },

  /**
   * Delete item to cart
   *
   * @param {*} id
   * @param {*} data
   * @param {*} attr
   */
  async deleteToCart (id, data, attr) {
    let deleted = false
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    while (Bot.isRunning(id) && !deleted) {
      counter++

      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'initializing cart', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Cleaning cart - item ${data.item_id}...`)

        const params = {
          token: currentTask.transactionData.token.token,
          id: data.item_id,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.delete(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error)

          if (response.error && response.error.statusCode && response.error.statusCode === 404) {
            deleted = true
            break
          }
        } else if (response && !response.error) {
          deleted = true
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1056: ${error}`)
      }
    }

    return deleted
  },

  /**
   * Add product to cart
   *
   * @param {*} id
   */
  async addToCart (id) {
    let data = null
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const response = await this.attemptSizes(id, counter)

        if (!response) continue

        data = response
        break
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1087: ${error}`)
      }
    }

    return data
  },

  /**
   * Attempt to cart sizes
   *
   * @param id
   * @param counter
   */
  async attemptSizes (id, counter) {
    let data = null
    let currentTask = await Bot.getCurrentTask(id)

    for (let index = 0; index < currentTask.sizes.length; index++) {
      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const ext = []
        let label = currentTask.sizes[index].label

        if (!currentTask.sizes[index].value) {
          // TODO: optimize this
          const product = await this.getProduct(id)

          if (product && product.items.length) {
            const attr = (product.items[0].attribute_set_id === Constant.TITAN_ATTRIBUTE_PRODUCTS.FOOTWEAR) ? 0 : 1
            const cnt = Math.floor(Math.random() * Constant.TITAN_ATTRIBUTES[attr].sizes.length)
            const selected = Constant.TITAN_ATTRIBUTES[attr].sizes[cnt]
            label = selected.label

            ext.push({
              option_id: Constant.TITAN_ATTRIBUTES[attr].attribute_id.toString(),
              option_value: parseInt(selected.value)
            })
          }
        } else {
          ext.push({
            option_id: currentTask.sizes[index].attribute_id.toString(),
            option_value: parseInt(currentTask.sizes[index].value)
          })
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const msg = `Size ${label.toUpperCase()} - trying`
        await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: msg })
        await Bot.updateCurrentTaskLog(id, `#${counter}: ${msg}`)

        const params = {
          token: currentTask.transactionData.token.token,
          payload: {
            cartItem: {
              qty: currentTask.qty || 1,
              quote_id: currentTask.transactionData.cart.id,
              sku: `${currentTask.sku}`,
              product_type: 'configurable',
              product_option: {
                extension_attributes: {
                  configurable_item_options: ext
                }
              },
              extension_attributes: {}
            }
          },
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.store(params)

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error)
        } else if (response && !response.error) {
          data = JSON.parse(response)
          data.size = label.toUpperCase()

          const msg = `Size ${label.toUpperCase()} - carted`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: msg })
          await Bot.updateCurrentTaskLog(id, `#${counter}: ${msg}`)

          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1200: ${error}`)
      }
    }

    return data
  },

  /**
   * Get product details
   *
   * @param {*} id
   * @returns
   */
  async getProduct (id) {
    let data = null
    let counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        let currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const params = {
          token: Config.services.titan22.token,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id,
          payload: {
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
        }

        if (!Bot.isRunning(id)) break

        const response = await productApi.search(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error)
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1276: ${error}`)
      }
    }

    return data
  },

  /**
   * Perform setting of shipping information
   *
   * @param {*} id
   */
  async setShippingInfo (id) {
    let data = null
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    if (!Bot.isRunning(id) || !currentTask) return data

    const email = currentTask.transactionData.account.email
    const defaultShippingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_shipping)
    const defaultBillingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_billing)

    // estimate shipping
    let params = null

    if (currentTask.transactionData.product.price <= 7000) {
      while (Bot.isRunning(id) && currentTask && !params) {
        counter++

        try {
          currentTask = await Bot.getCurrentTask(id)
          if (!Bot.isRunning(id) || !currentTask) break

          if (counter > 1) {
            let interval = null
            let timeout = null
            await new Promise((resolve) => {
              interval = setInterval(() => {
                timeout = setTimeout(() => {
                  clearInterval(interval)
                  resolve()
                }, currentTask.delay)
              }, 500)
            })
            clearInterval(interval)
            clearTimeout(timeout)
          }

          currentTask = await Bot.getCurrentTask(id)
          if (!Bot.isRunning(id) || !currentTask) break

          const waitingMsg = `Size ${currentTask.transactionData.product.size} - estimating shipping`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, `#${counter}: ${waitingMsg}`)

          const parameters = {
            token: currentTask.transactionData.token.token,
            payload: { addressId: defaultShippingAddress.id },
            mode: currentTask.mode,
            config: this.getConfig(currentTask.proxy),
            taskId: currentTask.id
          }

          if (!Bot.isRunning(id)) break

          const response = await cartApi.estimateShipping(parameters)

          if (!Bot.isRunning(id)) break

          if (response && response.error) {
            await this.handleError(id, counter, response.error)
          } else if (response && !response.error) {
            params = JSON.parse(response)[0]
            break
          }
        } catch (error) {
          await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1353: ${error}`)
        }
      }
    } else {
      params = {
        carrier_code: 'freeshipping',
        method_code: 'freeshipping'
      }
    }

    if (!Bot.isRunning(id) || !params) return data

    // set shipping
    const shippingAddress = await this.setAddresses(defaultShippingAddress, email)
    const billingAddress = await this.setAddresses(defaultBillingAddress, email)

    const payload = {
      addressInformation: {
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method_code: params.method_code,
        shipping_carrier_code: params.carrier_code
      }
    }

    counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const waitingMsg = `Size ${currentTask.transactionData.product.size} - setting shipping details`
        await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: waitingMsg })
        await Bot.updateCurrentTaskLog(id, `#${counter}: ${waitingMsg}`)

        const params = {
          token: currentTask.transactionData.token.token,
          payload: payload,
          mode: currentTask.mode,
          config: this.getConfig(currentTask.proxy),
          taskId: currentTask.id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.setShippingInformation(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error)
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1430: ${error}`)
      }
    }

    return data
  },

  /**
   * Perform placing of order
   *
   * @param {*} id
   */
  async placeOrder (id) {
    let data = null

    try {
      let currentTask = await Bot.getCurrentTask(id)
      if (!Bot.isRunning(id) || !currentTask) return data

      const waitingMsg = `Size ${currentTask.transactionData.product.size} - waiting to place order`
      await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: waitingMsg })
      await Bot.updateCurrentTaskLog(id, waitingMsg)

      if (currentTask.placeOrder) {
        let interval = null
        let timeout = null
        const vm = this
        await new Promise((resolve) => {
          interval = setInterval(() => {
            const now = new Date()
            const then = new Date(moment(currentTask.placeOrder, 'HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'))
            timeout = setTimeout(() => {
              vm.removeTimer(id)
              clearInterval(interval)
              resolve()
            }, then - now)
          }, 500)
        })
        clearInterval(interval)
        clearTimeout(timeout)
      }

      currentTask = await Bot.getCurrentTask(id)
      if (!Bot.isRunning(id) || !currentTask) return data

      const defaultBillingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_billing)
      const address = await this.setAddresses(defaultBillingAddress, currentTask.transactionData.account.email)
      const confs = await this.getConfig(currentTask.proxy)

      const payload = {
        payload: {
          billingAddress: address,
          cardId: currentTask.transactionData.cart.id.toString(),
          paymentMethod: {
            method: '',
            po_number: null,
            additional_data: null
          }
        },
        token: currentTask.transactionData.token.token,
        mode: currentTask.mode,
        config: confs,
        taskId: currentTask.id
      }

      switch (currentTask.checkoutMethod.id) {
        // PayMaya
        case 1:
        {
          const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(PayMaya)`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
          await Bot.updateCurrentTaskLog(id, placingMsg)

          payload.payload.paymentMethod.method = 'paymaya_checkout'
          data = await this.paymayaCheckout(id, payload)

          break
        }

        // 2c2p
        case 2:
        {
          const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(2c2p)`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
          await Bot.updateCurrentTaskLog(id, placingMsg)

          payload.payload.paymentMethod.method = 'ccpp'
          data = await this.creditCardCheckout(id, payload)

          break
        }

        // PayPal
        case 3:
        {
          const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(PayPal)`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
          await Bot.updateCurrentTaskLog(id, placingMsg)

          payload.payload.paymentMethod.method = 'braintree_paypal'

          if (currentTask.account.paypal && currentTask.account.paypal.account) {
            payload.payload.paymentMethod.additional_data = {
              paypal_express_checkout_token: currentTask.account.paypal.token,
              paypal_express_checkout_redirect_required: false,
              paypal_express_checkout_payer_id: currentTask.account.paypal.PayerID,
              payment_method_nonce: currentTask.account.paypal.account.paypalAccounts[0].nonce
            }
          }

          data = await this.paypalCheckout(id, payload)

          break
        }

        // Auto
        default:
        {
          if (currentTask.account.paypal && currentTask.account.paypal.account) {
            switch (currentTask.transactionData.shipping.payment_methods.slice().find((val) => val.code).code) {
              // PayPal
              case 'braintree_paypal':
              {
                const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(PayPal)`
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                payload.payload.paymentMethod.method = 'braintree_paypal'

                payload.payload.paymentMethod.additional_data = {
                  paypal_express_checkout_token: currentTask.account.paypal.token,
                  paypal_express_checkout_redirect_required: false,
                  paypal_express_checkout_payer_id: currentTask.account.paypal.PayerID,
                  payment_method_nonce: currentTask.account.paypal.account.paypalAccounts[0].nonce
                }

                data = await this.paypalCheckout(id, payload)

                break
              }

              // PayMaya
              case 'paymaya_checkout':
              {
                const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(PayMaya)`
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                payload.payload.paymentMethod.method = 'paymaya_checkout'
                data = await this.paymayaCheckout(id, payload)

                break
              }

              // 2c2p
              case 'ccpp':
              {
                const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(2c2p)`
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                payload.payload.paymentMethod.method = 'ccpp'
                data = await this.creditCardCheckout(id, payload)

                break
              }

              // no available
              default:
              {
                const placingMsg = 'Payment method not available'
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                break
              }
            }
          } else {
            switch (currentTask.transactionData.shipping.payment_methods.slice().find((val) => val.code).code) {
              // PayMaya
              case 'paymaya_checkout':
              {
                const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(PayMaya)`
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                payload.payload.paymentMethod.method = 'paymaya_checkout'
                data = await this.paymayaCheckout(id, payload)

                break
              }

              // 2c2p
              case 'ccpp':
              {
                const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(2c2p)`
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                payload.payload.paymentMethod.method = 'ccpp'
                data = await this.creditCardCheckout(id, payload)

                break
              }

              // PayPal
              case 'braintree_paypal':
              {
                const placingMsg = `Size ${currentTask.transactionData.product.size} - placing order(PayPal)`
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                payload.payload.paymentMethod.method = 'braintree_paypal'

                if (currentTask.account.paypal && currentTask.account.paypal.account) {
                  payload.payload.paymentMethod.additional_data = {
                    paypal_express_checkout_token: currentTask.account.paypal.token,
                    paypal_express_checkout_redirect_required: false,
                    paypal_express_checkout_payer_id: currentTask.account.paypal.PayerID,
                    payment_method_nonce: currentTask.account.paypal.account.paypalAccounts[0].nonce
                  }
                }

                data = await this.paypalCheckout(id, payload)

                break
              }

              // no available
              default:
              {
                const placingMsg = 'Payment method not available'
                await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: placingMsg })
                await Bot.updateCurrentTaskLog(id, placingMsg)

                break
              }
            }
          }

          break
        }
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `Line 1674: ${error}`)
    }

    return data
  },

  /**
   * PayMaya checkout method
   *
   * @param {*} id
   * @param {*} payload
   */
  async paymayaCheckout (id, payload) {
    let data = null
    const tries = 3
    let currentTask = await Bot.getCurrentTask(id)

    for (let index = 1; index <= tries; index++) {
      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (index > 1) {
          const waitingMsg = `Size ${currentTask.transactionData.product.size} - retrying`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, waitingMsg)
        }

        const paymentInformation = await this.setPaymentInformation(id, payload)

        if (!paymentInformation) continue

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const params = {
          mode: currentTask.mode,
          config: payload.config,
          taskId: currentTask.id
        }

        const order = await orderApi.paymaya(params)

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        // TODO: double check
        data = order.request.uri.href
        break
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `Line 1724: ${error}`)
      }
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return null

    if (data) {
      const img = await this.searchProduct(id)

      currentTask = await Bot.getCurrentTask(id)
      if (!Bot.isRunning(id) || !currentTask) return null

      const msg = `Size ${currentTask.transactionData.product.size} - copped!`

      currentTask.transactionData.product.image = img
      currentTask.transactionData.checkoutLink = data
      currentTask.transactionData.method = 'PayMaya'
      currentTask.status = {
        id: Constant.STATUS.RUNNING,
        msg: msg,
        class: 'success'
      }

      await Bot.updateCurrentTaskLog(id, msg)
      await Tasks.dispatch('updateItem', currentTask)

      return data
    }

    const msg = `Size ${currentTask.transactionData.product.size} - out of luck`
    await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: msg })
    await Bot.updateCurrentTaskLog(id, msg)

    return null
  },

  /**
   * 2c2p checkout method
   *
   * @param {*} id
   * @param {*} payload
   */
  async creditCardCheckout (id, payload) {
    let data = null
    const tries = 3
    let currentTask = await Bot.getCurrentTask(id)

    for (let index = 1; index <= tries; index++) {
      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (index > 1) {
          const waitingMsg = `Size ${currentTask.transactionData.product.size} - retrying`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, waitingMsg)
        }

        const paymentInformation = await this.setPaymentInformation(id, payload)

        if (!paymentInformation) continue

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const transactionData = await this.getTransactionData(id, payload)

        if (!transactionData) continue

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const cookie = await this.get2c2pCookie(id, payload, transactionData)

        if (!cookie) continue

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        data = cookie

        if (data) break
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `Line 1808: ${error}`)
      }
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return null

    if (data) {
      const img = await this.searchProduct(id)

      currentTask = await Bot.getCurrentTask(id)
      if (!Bot.isRunning(id) || !currentTask) return null

      const msg = `Size ${currentTask.transactionData.product.size} - copped!`

      currentTask.transactionData.product.image = img
      currentTask.transactionData.cookie = data.cookie
      currentTask.transactionData.method = '2c2p'
      currentTask.transactionData.order = data.data
      currentTask.status = {
        id: Constant.STATUS.RUNNING,
        msg: msg,
        class: 'success'
      }

      await Bot.updateCurrentTaskLog(id, msg)
      await Tasks.dispatch('updateItem', currentTask)

      return data
    }

    const msg = `Size ${currentTask.transactionData.product.size} - out of luck`
    await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: msg })
    await Bot.updateCurrentTaskLog(id, msg)

    return null
  },

  /**
   * PayPal checkout method
   *
   * @param {*} id
   * @param {*} payload
   */
  async paypalCheckout (id, payload) {
    let data = null
    const tries = 3
    let currentTask = await Bot.getCurrentTask(id)

    for (let index = 1; index <= tries; index++) {
      try {
        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (index > 1) {
          const waitingMsg = `Size ${currentTask.transactionData.product.size} - retrying`
          await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, waitingMsg)
        }

        const response = await this.setPaymentInformation(id, payload)

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (response) {
          data = response
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `Line 1878: ${error}`)
      }
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return null

    if (data) {
      const img = await this.searchProduct(id)

      currentTask = await Bot.getCurrentTask(id)
      if (!Bot.isRunning(id) || !currentTask) return null

      const msg = `Size ${currentTask.transactionData.product.size} - copped!`

      currentTask.transactionData.product.image = img
      currentTask.transactionData.method = 'PayPal'
      currentTask.status = {
        id: Constant.STATUS.RUNNING,
        msg: msg,
        class: 'success'
      }

      await Accounts.dispatch('updateItem', {
        ...currentTask.account,
        paypal: {
          ...currentTask.account.paypal,
          account: null,
          expires_in: null
        }
      })
      await Bot.updateCurrentTaskLog(id, msg)
      await Tasks.dispatch('updateItem', currentTask)

      return data
    }

    const msg = `Size ${currentTask.transactionData.product.size} - out of luck`
    await Bot.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: msg })
    await Bot.updateCurrentTaskLog(id, msg)

    return null
  },

  /**
   * Set payment information
   *
   * @param {*} id
   * @param {*} payload
   */
  async setPaymentInformation (id, payload) {
    let data = null
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    try {
      while (Bot.isRunning(id) && currentTask && !data) {
        counter++

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const timer = new StopWatch(true)

        const response = await cartApi.paymentInformation(payload)

        timer.stop()

        const speed = (timer.read() / 1000.0).toFixed(2)

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        currentTask.transactionData.timer = speed

        await Tasks.dispatch('updateItem', currentTask)

        if (response && response.error) {
          await this.handleError(id, counter, response.error)
        } else if (response && !response.error) {
          data = response
          break
        }
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `#${counter} at Line 1981: ${error}`)
    }

    return data
  },

  /**
   * Get order transaction data
   *
   * @param {*} id
   * @param {*} payload
   */
  async getTransactionData (id, payload) {
    let data = null
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    try {
      while (Bot.isRunning(id) && currentTask && !data) {
        counter++

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const params = {
          token: currentTask.transactionData.token.token,
          mode: currentTask.mode,
          config: payload.config,
          taskId: currentTask.id
        }

        const response = await orderApi.getTransactionData(params)

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error)
        } else if (response && !response.error) {
          data = response
          break
        }
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `#${counter} at Line 2043: ${error}`)
    }

    return data
  },

  /**
   * Get cookie for 2c2p
   *
   * @param {*} id
   * @param {*} payload
   * @param {*} transactionData
   */
  async get2c2pCookie (id, payload, transactionData) {
    let data = null
    let counter = 0
    let currentTask = await Bot.getCurrentTask(id)

    try {
      while (Bot.isRunning(id) && currentTask && !data) {
        counter++

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (counter > 1) {
          let interval = null
          let timeout = null
          await new Promise((resolve) => {
            interval = setInterval(() => {
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, currentTask.delay)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        const params = {
          mode: currentTask.mode,
          config: payload.config,
          taskId: currentTask.id
        }

        let orderNumber = null
        const parameters = {}
        const fieldRecords = JSON.parse(transactionData).fields
        const valueRecords = JSON.parse(transactionData).values

        for (let index = 0; index < fieldRecords.length; index++) {
          parameters[fieldRecords[index]] = valueRecords[index]
          if (fieldRecords[index] === 'order_id') orderNumber = valueRecords[index]
        }

        params.form = parameters

        const response = await orderApi.place2c2pOrder(params)

        currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

        if (response.error && response.error.options) {
          let cookie = null

          await response.error.options.jar._jar.store.getAllCookies((err, cookieArray) => {
            if (err) cookie = null

            cookie = cookieArray.find((val) => val.key === 'ASP.NET_SessionId')
          })

          if (cookie) {
            data = {
              cookie: {
                name: 'ASP.NET_SessionId',
                value: cookie.value,
                domain: '.2c2p.com',
                expiry: cookie.expiry
              },
              data: orderNumber
            }

            break
          }
        }
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `#${counter} at Line 2134: ${error}`)
    }

    return data
  },

  /**
   * Perform product search
   *
   * @param {*} id
   */
  async searchProduct (id) {
    let data = null

    const currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return data

    const params = {
      payload: {
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
      },
      token: Config.services.titan22.token,
      mode: currentTask.mode,
      config: this.getConfig(currentTask.proxy),
      taskId: currentTask.id
    }

    const response = await productApi.search(params)

    if (response && !response.error) {
      try {
        const image = JSON.parse(response).items[0].custom_attributes.find((val) => val.attribute_code === 'image')
        data = `${Config.services.titan22.url}/media/catalog/product${image.value}`
      } catch (error) {
        data = ''
      }
    }

    return data
  },

  /**
   * Perform on success event
   *
   * @param {*} id
   */
  async onSuccess (id) {
    const currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return false

    delete currentTask.transactionData.token
    delete currentTask.transactionData.account
    delete currentTask.transactionData.cart

    currentTask.status = {
      ...currentTask.status,
      id: Constant.STATUS.STOPPED
    }

    await Tasks.dispatch('updateItem', currentTask)
    await Bot.updateCurrentTaskLog(id, '====================')

    if (currentTask.autoPay) this.redirectToCheckout(id)

    if (Settings.state.items.withSound) {
      const sound = new Howl({
        src: [SuccessEffect]
      })
      sound.play()
    }

    Toastify({
      text: 'Checkout!',
      duration: 3000,
      newWindow: true,
      close: false,
      gravity: 'bottom',
      position: 'right',
      backgroundColor: '#228B22',
      className: 'toastify'
    }).showToast()

    const webhook = {
      productName: currentTask.transactionData.product.name,
      productSku: currentTask.transactionData.product.sku,
      productImage: currentTask.transactionData.product.image,
      checkoutMethod: currentTask.transactionData.method,
      checkoutTime: currentTask.transactionData.timer,
      delay: currentTask.delay
    }

    await new Promise(resolve => setTimeout(resolve, 3000))

    // send to personal webhook
    if (Settings.state.items.webhookUrl) {
      const personalWebhook = {
        ...webhook,
        url: Settings.state.items.webhookUrl,
        accountName: currentTask.account.name,
        checkoutLink: (currentTask.transactionData.method === 'PayMaya') ? currentTask.transactionData.checkoutLink : '',
        checkoutCookie: (currentTask.transactionData.cookie) ? currentTask.transactionData.cookie.value : '',
        proxyList: currentTask.proxy.name,
        orderNumber: currentTask.transactionData.order,
        mode: currentTask.mode.label
      }
      Webhook.sendWebhook(personalWebhook)
    }

    // send to public webhook
    const publicWebhook = {
      ...webhook,
      url: Config.bot.webhook
    }
    Webhook.sendWebhook(publicWebhook)
  },

  /**
   * Proceed to checkout page
   *
   * @param {*} id
   */
  async redirectToCheckout (id) {
    const currentTask = await Bot.getCurrentTask(id)

    switch (currentTask.transactionData.method) {
      case 'PayMaya':
        PayMayaCheckout.automate(id)
        break
      case '2c2p':
        CreditCardCheckout.automate(id)
        break
    }
  }
}
