import { Howl } from 'howler'
import { ipcRenderer } from 'electron'

import StopWatch from 'statman-stopwatch'
import moment from 'moment-timezone'

import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

import vanillaPuppeteer from 'puppeteer'
import { addExtra } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import ProxyChain from 'proxy-chain'
import { Cookie } from 'tough-cookie'

import Constant from '@/config/constant'
import Config from '@/config/app'

import SuccessEffect from '@/assets/success.mp3'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import orderApi from '@/api/magento/titan22/order'
import productApi from '@/api/magento/titan22/product'

import Bot from '@/services/index'

import store from '@/store/index'

const Tasks = store._modules.root._children.task.context
const Settings = store._modules.root._children.setting.context
const PayPal = store._modules.root._children.paypal.context

const blockedResources = ['queue-it']

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

    if (moment(currentTask.transactionData.token.expires_in) >= moment().format('YYYY-MM-DD HH:mm:ss')) {
      const token = await this.authenticate(id)
      currentTask = await Bot.getCurrentTask(id)

      if (Bot.isRunning(id) && token && Object.keys(token).length && currentTask) {
        currentTask.transactionData.token = token
        Tasks.dispatch('updateItem', currentTask)
      }
    }
  },

  /**
   * Handle API error responses
   *
   * @param {*} id
   * @param {*} counter
   * @param {*} response
   * @param {*} attr
   */
  async handleError (id, counter, response, attr = 'orange') {
    try {
      try {
        if (response.statusCode && response.statusCode === 503) {
          await Bot.updateCurrentTaskLog(id, `#${counter} at Line87: 503 access denied`)
        } else {
          await Bot.updateCurrentTaskLog(id, `#${counter} at Line87: ${response.message}`)
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line 94: ${error}`)
      }

      if (response.statusCode) {
        await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: response.statusCode, attr: 'red' })

        switch (response.statusCode) {
          case 401:
            {
              if (!Bot.isRunning(id)) break

              const token = await this.authenticate(id, attr)
              const currentTask = await Bot.getCurrentTask(id)

              if (Bot.isRunning(id) && token && Object.keys(token).length && currentTask) {
                currentTask.transactionData.token = token
                Tasks.dispatch('updateItem', currentTask)
              }
            }
            break

          case 503:
            {
              await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: 'Bypassing', attr })

              const options = await this.getCloudflareClearance(id, response)

              const currentTask = await Bot.getCurrentTask(id)
              currentTask.options = options
              Tasks.dispatch('updateItem', currentTask)
            }
            break
        }
      } else {
        await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: 'error', attr: 'red' })
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `#${counter} at Line 119: ${error}`)
    }
  },

  /**
   * Retrieve cloudflare cookies
   *
   * @param {*} id
   * @param {*} response
   */
  async getCloudflareClearance (id, response) {
    const { options } = response

    try {
      const puppeteer = addExtra(vanillaPuppeteer)
      const stealth = StealthPlugin()
      puppeteer.use(stealth)

      const args = ['--no-sandbox', '--disable-setuid-sandbox']

      if (options.proxy) {
        const oldProxyUrl = options.proxy
        const newProxyUrl = await ProxyChain.anonymizeProxy(oldProxyUrl)

        args.push(`--proxy-server=${newProxyUrl}`)
      }

      args.push(`--user-agent=${options.headers['User-Agent']}`)

      const browser = await puppeteer.launch({
        args,
        headless: false
      })

      if (!Bot.isRunning(id)) browser.close()

      const page = await browser.newPage()

      await page.setRequestInterception(true)

      if (!Bot.isRunning(id)) browser.close()

      page.on('request', (request) => {
        if (!Bot.isRunning(id)) browser.close()

        if (request.url().endsWith('.png') || request.url().endsWith('.jpg')) {
        // BLOCK IMAGES
          request.abort()
        } else if (blockedResources.some(resource => request.url().indexOf(resource) !== -1)) {
        // BLOCK CERTAIN DOMAINS
          request.abort()
        } else {
        // ALLOW OTHER REQUESTS
          request.continue()
        }
      })

      page.on('response', () => {
        if (!Bot.isRunning(id)) browser.close()
      })

      if (!Bot.isRunning(id)) browser.close()

      await page.goto(`${Config.services.titan22.url}/new-arrivals.html`)

      if (!Bot.isRunning(id)) browser.close()

      let content = await page.content()

      if (!Bot.isRunning(id)) browser.close()

      // TODO: captcha

      if (content.includes('cf-browser-verification')) {
        let counter = 0

        while (content.includes('cf-browser-verification')) {
          if (!Bot.isRunning(id)) browser.close()

          counter++

          if (counter >= 3) break

          await page.waitForNavigation({
            timeout: 45000,
            waitUntil: 'domcontentloaded'
          })

          if (!Bot.isRunning(id)) browser.close()

          let cookies = await page._client.send('Network.getAllCookies')
          cookies = cookies.cookies

          for (const cookie of cookies) {
            const data = new Cookie({
              key: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path
            }).toString()

            options.jar.setCookie(data, Config.services.titan22.url)
          }

          content = await page.content()
        }
      }

      // TODO: captcha

      await browser.close()
    } catch (error) {
      console.log(error)
    }

    return options
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

    if (token) {
      currentTask.transactionData.token = token
      await Tasks.dispatch('updateItem', currentTask)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.verify(id)
      return false
    }

    if (!Bot.isRunning(id)) return false

    await this.checkTokenExpiration(id)

    if (!Bot.isRunning(id)) return false

    /**
     * Step 2: get account
     *
     * get account data
     */
    const account = await this.getAccount(id, 'cyan')

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

    if (!Bot.isRunning(id)) return false

    await this.checkTokenExpiration(id)

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
      Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.STOPPED, msg: 'ready', attr: 'light-blue' })
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
      account = await this.getAccount(id)
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
      const cart = await this.getCart(id)

      currentTask = await Bot.getCurrentTask(id)
      if (!Bot.isRunning(id) || !currentTask) return false

      if (cart) {
        currentTask.transactionData.cart = cart
      } else {
        delete currentTask.transactionData.cart
      }

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

        await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: 'authenticating', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Logging in...`)

        const params = {
          payload: {
            username: currentTask.profile.email,
            password: currentTask.profile.password
          },
          proxy: currentTask.proxy,
          mode: currentTask.mode,
          taskId: id
        }

        if (!Bot.isRunning(id)) break

        const response = await authApi.fetchToken(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
          continue
        } else if (response && !response.error) {
          data = {
            token: JSON.parse(response),
            expires_in: moment().add(50, 'minutes').format('YYYY-MM-DD HH:mm:ss')
          }

          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line429: ${error}`)
        continue
      }
    }

    return data
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
          proxy: currentTask.proxy,
          mode: currentTask.mode,
          taskId: id
        }

        if (!Bot.isRunning(id)) break

        const response = await customerApi.profile(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
          continue
        } else if (response && !response.error && JSON.parse(response) && JSON.parse(response).addresses.length) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line494: ${error}`)
        continue
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

        await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: 'initializing cart', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Creating cart...`)

        const params = {
          token: currentTask.transactionData.token.token,
          proxy: currentTask.proxy,
          mode: currentTask.mode,
          taskId: id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.create(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
          continue
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line575: ${error}`)
        continue
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

        await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: 'initializing cart', attr: attr })
        await Bot.updateCurrentTaskLog(id, `#${counter}: Creating cart...`)

        const params = {
          token: currentTask.transactionData.token.token,
          proxy: currentTask.proxy,
          mode: currentTask.mode,
          taskId: id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.get(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error, attr)
          continue
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line642: ${error}`)
        continue
      }
    }

    if (!Bot.isRunning(id)) return null

    // Clean cart
    if (data && data.items.length) {
      counter = 0

      for (let index = 0; index < data.items.length; index++) {
        let deleted = false

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

            await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: 'initializing cart', attr: attr })
            await Bot.updateCurrentTaskLog(id, `#${counter}: Cleaning cart - item ${index + 1}...`)

            const params = {
              token: currentTask.transactionData.token.token,
              id: data.items[index].item_id,
              proxy: currentTask.proxy,
              mode: currentTask.mode,
              taskId: id
            }

            if (!Bot.isRunning(id)) break

            const response = await cartApi.delete(params)

            if (!Bot.isRunning(id)) break

            if (response && response.error) {
              await this.handleError(id, counter, response.error)

              if (response.error && response.error.statusCode && response.error.statusCode === 404) deleted = true

              continue
            } else if (response && !response.error) {
              deleted = true
              continue
            }
          } catch (error) {
            await Bot.updateCurrentTaskLog(id, `#${counter} at Line706: ${error}`)
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
   * @param {*} id
   */
  async addToCart (id) {
    let data = null
    let counter = 0

    while (Bot.isRunning(id) && !data) {
      counter++

      try {
        let currentTask = await Bot.getCurrentTask(id)
        if (!Bot.isRunning(id) || !currentTask) break

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

            const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - trying`
            await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: msg })
            await Bot.updateCurrentTaskLog(id, `#${counter}: ${msg}`)

            const params = {
              token: currentTask.transactionData.token.token,
              payload: {
                cartItem: {
                  sku: `${currentTask.sku}-SZ${currentTask.sizes[index].label.replace('.', 'P').toUpperCase()}`,
                  qty: currentTask.qty || 1,
                  quote_id: currentTask.transactionData.cart.id,
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
              },
              proxy: currentTask.proxy,
              mode: currentTask.mode,
              taskId: id
            }

            if (!Bot.isRunning(id)) break

            const response = await cartApi.store(params)

            currentTask = await Bot.getCurrentTask(id)
            if (!Bot.isRunning(id) || !currentTask) break

            if (response && response.error) {
              await this.handleError(id, counter, response.error)
              continue
            } else if (response && !response.error) {
              data = JSON.parse(response)
              data.size = currentTask.sizes[index].label.toUpperCase()

              const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - carted`
              await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: msg })
              await Bot.updateCurrentTaskLog(id, `#${counter}: ${msg}`)

              break
            } else {
              continue
            }
          } catch (error) {
            await Bot.updateCurrentTaskLog(id, `#${counter} at Line807: ${error}`)
            continue
          }
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line812: ${error}`)
        continue
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

          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - estimating shipping`
          await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, `#${counter}: ${waitingMsg}`)

          const parameters = {
            token: currentTask.transactionData.token.token,
            payload: { addressId: defaultShippingAddress.id },
            proxy: currentTask.proxy,
            mode: currentTask.mode,
            taskId: id
          }

          if (!Bot.isRunning(id)) break

          const response = await cartApi.estimateShipping(parameters)

          if (!Bot.isRunning(id)) break

          if (response && response.error) {
            await this.handleError(id, counter, response.error)

            if (response.error && response.error.statusCode && response.error.statusCode === 400) {
              currentTask = await Bot.getCurrentTask(id)
              delete currentTask.transactionData.cart
              await Tasks.dispatch('updateItem', currentTask)
              break
            } else {
              continue
            }
          } else if (response && !response.error) {
            params = JSON.parse(response)[0]
            break
          }
        } catch (error) {
          await Bot.updateCurrentTaskLog(id, `#${counter} at Line891: ${error}`)
          continue
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
        shipping_carrier_code: params.carrier_code,
        shipping_method_code: params.method_code
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

        const waitingMsg = `Size: ${currentTask.transactionData.product.size} - setting shipping details`
        await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: waitingMsg })
        await Bot.updateCurrentTaskLog(id, `#${counter}: ${waitingMsg}`)

        const params = {
          token: currentTask.transactionData.token.token,
          payload: payload,
          proxy: currentTask.proxy,
          mode: currentTask.mode,
          taskId: id
        }

        if (!Bot.isRunning(id)) break

        const response = await cartApi.setShippingInformation(params)

        if (!Bot.isRunning(id)) break

        if (response && response.error) {
          await this.handleError(id, counter, response.error)

          if (response.error && response.error.statusCode && response.error.statusCode === 400) {
            currentTask = await Bot.getCurrentTask(id)
            delete currentTask.transactionData.cart
            await Tasks.dispatch('updateItem', currentTask)
            break
          } else {
            continue
          }
        } else if (response && !response.error) {
          data = JSON.parse(response)
          break
        }
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `#${counter} at Line970: ${error}`)
        continue
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

      const waitingMsg = `Size: ${currentTask.transactionData.product.size} - waiting to place order`
      await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: waitingMsg })
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

      const placingMsg = `Size: ${currentTask.transactionData.product.size} - placing order`
      await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: placingMsg })
      await Bot.updateCurrentTaskLog(id, placingMsg)

      const defaultBillingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_billing)

      const payload = {
        payload: {
          amcheckout: {},
          billingAddress: this.setAddresses(defaultBillingAddress, currentTask.transactionData.account.email),
          cartId: currentTask.transactionData.cart.id,
          paymentMethod: {
            additional_data: null,
            method: '',
            po_number: null
          }
        },
        token: currentTask.transactionData.token.token,
        proxy: currentTask.proxy,
        mode: currentTask.mode,
        taskId: id
      }

      switch (currentTask.checkoutMethod) {
        case 1:
          payload.payload.paymentMethod.method = 'paymaya_checkout'
          data = await this.paymayaCheckout(id, payload)
          break

        case 2:
          payload.payload.paymentMethod.method = 'ccpp'
          data = await this.creditCardCheckout(id, payload)
          break

        case 3:
          payload.payload.paymentMethod.method = 'braintree_paypal'

          if (currentTask.profile.paypal && Object.keys(currentTask.profile.paypal).length) {
            payload.payload.paymentMethod.additional_data = {
              paypal_express_checkout_token: currentTask.profile.paypal.paypalAccounts[0].details.correlationId,
              paypal_express_checkout_redirect_required: false,
              paypal_express_checkout_payer_id: currentTask.profile.paypal.paypalAccounts[0].details.payerInfo.payerId,
              payment_method_nonce: currentTask.profile.paypal.paypalAccounts[0].nonce
            }
          } else if (PayPal.state.items && Object.keys(PayPal.state.items).length) {
            payload.payload.paymentMethod.additional_data = {
              paypal_express_checkout_token: PayPal.state.items.paypalAccounts[0].details.correlationId,
              paypal_express_checkout_redirect_required: false,
              paypal_express_checkout_payer_id: PayPal.state.items.paypalAccounts[0].details.payerInfo.payerId,
              payment_method_nonce: PayPal.state.items.paypalAccounts[0].nonce
            }
          }

          data = await this.paypalCheckout(id, payload)
          break

        default:
          switch (currentTask.transactionData.shipping.payment_methods.slice().find((val) => val.code).code) {
            case 'paymaya_checkout':
              payload.payload.paymentMethod.method = 'paymaya_checkout'
              data = await this.paymayaCheckout(id, payload)
              break

            case 'ccpp':
              payload.payload.paymentMethod.method = 'ccpp'
              data = await this.creditCardCheckout(id, payload)
              break

            case 'braintree_paypal':
              payload.payload.paymentMethod.method = 'braintree_paypal'

              if (currentTask.profile.paypal && Object.keys(currentTask.profile.paypal).length) {
                payload.payload.paymentMethod.additional_data = {
                  paypal_express_checkout_token: currentTask.profile.paypal.paypalAccounts[0].details.correlationId,
                  paypal_express_checkout_redirect_required: false,
                  paypal_express_checkout_payer_id: currentTask.profile.paypal.paypalAccounts[0].details.payerInfo.payerId,
                  payment_method_nonce: currentTask.profile.paypal.paypalAccounts[0].nonce
                }
              } else if (PayPal.state.items && Object.keys(PayPal.state.items).length) {
                payload.payload.paymentMethod.additional_data = {
                  paypal_express_checkout_token: PayPal.state.items.paypalAccounts[0].details.correlationId,
                  paypal_express_checkout_redirect_required: false,
                  paypal_express_checkout_payer_id: PayPal.state.items.paypalAccounts[0].details.payerInfo.payerId,
                  payment_method_nonce: PayPal.state.items.paypalAccounts[0].nonce
                }
              }

              data = await this.paypalCheckout(id, payload)

              break
          }
          break
      }
    } catch (error) {
      await Bot.updateCurrentTaskLog(id, `Line1110: ${error}`)
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
          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - retrying`
          await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, waitingMsg)
        }

        let counter = 0

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

          if (!Bot.isRunning(id)) break

          const timer = new StopWatch(true)

          const response = await orderApi.placePaymayaOrder(payload)

          timer.stop()

          const speed = (timer.read() / 1000.0).toFixed(2)

          currentTask = await Bot.getCurrentTask(id)
          if (!Bot.isRunning(id) || !currentTask) break

          currentTask.transactionData.timer = speed

          await Tasks.dispatch('updateItem', currentTask)

          if (response && response.error) {
            await this.handleError(id, counter, response.error)

            if (response.error.statusCode !== 429) break

            continue
          } else if (response && !response.error && response.request.uri.href) {
            data = response.request.uri.href
            break
          }
        }

        if (data) break
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `Line1192: ${error}`)
        continue
      }
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return null

    if (!data) {
      const msg = `Size: ${currentTask.transactionData.product.size} - out of luck`
      await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: msg })
      await Bot.updateCurrentTaskLog(id, msg)
    } else {
      const msg = `Size: ${currentTask.transactionData.product.size} - copped!`
      const img = await this.searchProduct(id)

      currentTask.transactionData.product.image = img
      currentTask.transactionData.checkoutLink = data
      currentTask.transactionData.method = 'PayMaya'
      currentTask.logs = `${currentTask.logs || ''};${msg}`
      currentTask.status = {
        id: Constant.TASK.STATUS.RUNNING,
        msg: msg,
        class: 'success'
      }

      await Tasks.dispatch('updateItem', currentTask)
    }

    return data
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
          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - retrying`
          await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, waitingMsg)
        }

        let counter = 0

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

          if (!Bot.isRunning(id)) break

          const timer = new StopWatch(true)

          const response = await orderApi.place2c2pOrder(payload)

          timer.stop()

          const speed = (timer.read() / 1000.0).toFixed(2)

          currentTask = await Bot.getCurrentTask(id)
          if (!Bot.isRunning(id) || !currentTask) break

          currentTask.transactionData.timer = speed

          await Tasks.dispatch('updateItem', currentTask)

          if (response && response.error) {
            await this.handleError(id, counter, response.error)

            if (response.error.statusCode !== 429) break

            continue
          } else if (response && !response.error && response.cookie) {
            data = response
            break
          }
        }

        if (data) break
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `Line1300: ${error}`)
        continue
      }
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return null

    if (!data) {
      const msg = `Size: ${currentTask.transactionData.product.size} - out of luck`
      await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: msg })
      await Bot.updateCurrentTaskLog(id, msg)
    } else {
      const msg = `Size: ${currentTask.transactionData.product.size} - copped!`
      const img = await this.searchProduct(id)

      currentTask.transactionData.product.image = img
      currentTask.transactionData.cookie = data.cookie
      currentTask.transactionData.method = '2c2p'
      currentTask.transactionData.order = data.data
      currentTask.logs = `${currentTask.logs || ''};${msg}`
      currentTask.status = {
        id: Constant.TASK.STATUS.RUNNING,
        msg: msg,
        class: 'success'
      }

      await Tasks.dispatch('updateItem', currentTask)
    }

    return data
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
          const waitingMsg = `Size: ${currentTask.transactionData.product.size} - retrying`
          await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: waitingMsg })
          await Bot.updateCurrentTaskLog(id, waitingMsg)
        }

        let counter = 0

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

          if (!Bot.isRunning(id)) break

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

            if (response.error.statusCode !== 429) break

            continue
          } else if (response && !response.error) {
            data = response
            break
          }
        }

        if (data) break
      } catch (error) {
        await Bot.updateCurrentTaskLog(id, `Line1409: ${error}`)
        continue
      }
    }

    currentTask = await Bot.getCurrentTask(id)
    if (!Bot.isRunning(id) || !currentTask) return null

    if (!data) {
      const msg = `Size: ${currentTask.transactionData.product.size} - out of luck`
      await Bot.setCurrentTaskStatus(id, { status: Constant.TASK.STATUS.RUNNING, msg: msg })
      await Bot.updateCurrentTaskLog(id, msg)
    } else {
      const msg = `Size: ${currentTask.transactionData.product.size} - copped!`
      const img = await this.searchProduct(id)

      currentTask.transactionData.product.image = img
      currentTask.transactionData.method = 'PayPal'
      currentTask.logs = `${currentTask.logs || ''};${msg}`
      currentTask.status = {
        id: Constant.TASK.STATUS.RUNNING,
        msg: msg,
        class: 'success'
      }

      await Tasks.dispatch('updateItem', currentTask)
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
    if (!currentTask) return data

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
      proxy: currentTask.proxy
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
      id: Constant.TASK.STATUS.STOPPED
    }

    await Tasks.dispatch('updateItem', currentTask)

    if (Settings.state.items.autoPay && !currentTask.aco) this.redirectToCheckout(id)

    if (Settings.state.items.sound) {
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

    // send to aco webhook
    if (currentTask.transactionData.method === '2c2p' && currentTask.aco && currentTask.webhook) {
      const acoWebhook = {
        ...webhook,
        url: currentTask.webhook,
        profileName: currentTask.profile.name,
        checkoutLink: (currentTask.transactionData.method === 'PayMaya') ? currentTask.transactionData.checkoutLink : '',
        checkoutCookie: (currentTask.transactionData.cookie) ? currentTask.transactionData.cookie.value : '',
        orderNumber: currentTask.transactionData.order
      }
      Bot.sendWebhook(acoWebhook)
    }

    // send to personal webhook
    if (Settings.state.items.webhook) {
      const personalWebhook = {
        ...webhook,
        url: Settings.state.items.webhook,
        profileName: currentTask.profile.name,
        checkoutLink: (currentTask.transactionData.method === 'PayMaya') ? currentTask.transactionData.checkoutLink : '',
        checkoutCookie: (currentTask.transactionData.cookie) ? currentTask.transactionData.cookie.value : '',
        proxyList: currentTask.proxy.name,
        orderNumber: currentTask.transactionData.order,
        mode: currentTask.mode
      }
      Bot.sendWebhook(personalWebhook)
    }

    // send to public webhook
    const publicWebhook = {
      ...webhook,
      url: Config.bot.webhook
    }
    Bot.sendWebhook(publicWebhook)
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
        ipcRenderer.send('pay-with-paymaya', JSON.stringify({ task: currentTask, settings: Settings.state.items }))
        break
      case '2c2p':
        ipcRenderer.send('pay-with-2c2p', JSON.stringify({ task: currentTask, settings: Settings.state.items }))
        break
    }
  }
}
