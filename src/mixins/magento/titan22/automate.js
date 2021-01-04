import { mapState, mapActions } from 'vuex'
import { Howl } from 'howler'
import { ipcRenderer } from 'electron'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import orderApi from '@/api/magento/titan22/order'
import productApi from '@/api/magento/titan22/product'

import Constant from '@/config/constant'
import Config from '@/config/app'
import webhook from '@/mixins/webhook'
import SuccessEffect from '@/assets/success.mp3'

import StopWatch from 'statman-stopwatch'
import axios from 'axios'

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
  mixins: [webhook],
  computed: {
    ...mapState('task', { allTasks: 'items' }),
    ...mapState('setting', { settings: 'items' }),
    ...mapState('paypal', { paypal: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),

    /**
     * Get random proxy from pool
     */
    getProxy (task) {
      const proxy = this.activeTask(task).proxy.proxies[Math.floor(Math.random() * this.activeTask(task).proxy.proxies.length)]

      return {
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password
      }
    },
    /**
     * Check if the task is running.
     *
     */
    isRunning (id) {
      const task = this.allTasks.find((data) => data.id === id)

      if (task) return (task.status.id === Constant.TASK.STATUS.RUNNING)

      return false
    },

    /**
     * Set task status.
     *
     * @param {*} id
     * @param {*} status
     * @param {*} msg
     * @param {*} attr
     */
    async setTaskStatus (id, status, msg, attr) {
      const task = this.allTasks.find((data) => data.id === id)

      if (task) {
        await this.updateTask({
          ...task,
          status: {
            id: status,
            msg: msg,
            class: attr
          }
        })
      }
    },

    /**
     * Return active task
     *
     * @param {*} task
     */
    activeTask (task) {
      const runningTask = this.allTasks.find((data) => data.id === task.id)

      return runningTask || {}
    },

    /**
     * Initialize automation.
     *
     * @param {*} task
     */
    async init (task) {
      if (this.isRunning(task.id)) {
        await this.shopping(task)
      } else {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
      }
    },

    /**
     * Start shopping sequence.
     *
     * @param {*} task
     */
    async shopping (task) {
      let isAuthorized = true

      /**
       * Step 1: authenticate
       *
       * get user token
       */
      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'authenticating', 'orange')

      let tokenData = null

      await this.authenticate(task, (response) => { tokenData = response })

      if (!tokenData || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 2: get profile
       *
       * get profile data
       */
      let userData = {}

      await this.getProfile(task, tokenData, (response, authorized) => {
        isAuthorized = authorized
        userData = response
      })

      if (!isAuthorized) {
        this.updateTask({
          ...this.activeTask(task),
          transactionData: {}
        })

        this.init(this.activeTask(task))

        return false
      } else if (!Object.keys(userData).length || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 3: create cart
       *
       * create cart
       */
      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'initializing cart', 'orange')

      const user = {
        profile: userData,
        token: tokenData
      }

      let cartId = null

      await this.createCart(task, user, (response, authorized) => {
        isAuthorized = authorized
        cartId = response
      })

      if (!isAuthorized) {
        this.updateTask({
          ...this.activeTask(task),
          transactionData: {}
        })

        this.init(this.activeTask(task))

        return false
      } else if (!cartId || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 4: get cart
       *
       * get active cart
       */
      let cartData = {}

      await this.getCart(task, user, (response, authorized) => {
        isAuthorized = authorized
        cartData = response
      })

      if (!isAuthorized) {
        this.updateTask({
          ...this.activeTask(task),
          transactionData: {}
        })

        this.init(this.activeTask(task))

        return false
      } else if (!Object.keys(cartData).length || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 5: clean cart
       *
       * remove items inside cart
       */
      let cleanCartData = false

      await this.cleanCart(task, cartData, user, (response, authorized) => {
        isAuthorized = authorized
        cleanCartData = response
      })

      if (!isAuthorized) {
        this.updateTask({
          ...this.activeTask(task),
          transactionData: {}
        })

        this.init(this.activeTask(task))

        return false
      } else if (!cleanCartData || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 6: add item to cart
       *
       * add item to cart
       */
      let productData = {}

      await this.addItemToCart(task, cartData, user, (response, authorized) => {
        isAuthorized = authorized
        productData = response
      })

      if (!isAuthorized) {
        this.updateTask({
          ...this.activeTask(task),
          transactionData: {}
        })

        this.init(this.activeTask(task))

        return false
      } else if (!Object.keys(productData).length || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 7: set shipping info
       *
       * set shipping details
       */
      let shippingData = {}

      await this.setShippingInfo(task, user, productData, (response, authorized) => {
        isAuthorized = authorized
        shippingData = response
      })

      if (!isAuthorized) {
        this.updateTask({
          ...this.activeTask(task),
          transactionData: {}
        })

        this.init(this.activeTask(task))

        return false
      } else if (!Object.keys(shippingData).length || !this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      /**
       * Step 8: place order
       *
       * place order
       */
      await this.placeOrder(task, shippingData, user, cartData, productData)
    },

    /**
     * Authentication process.
     *
     * @param {*} task
     * @param {*} callback
     */
    async authenticate (task, callback) {
      let token = this.activeTask(task).transactionData.token

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Logging in...`
      })

      while (!token && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        const params = {
          payload: {
            username: this.activeTask(task).profile.email,
            password: this.activeTask(task).profile.password
          }
        }

        if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
          params.proxy = this.getProxy(this.activeTask(task))
        }

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        }

        const cancelTokenSource = axios.CancelToken.source()

        this.updateTask({
          ...this.activeTask(task),
          cancelTokenSource: cancelTokenSource
        })

        const apiResponse = await authApi.fetchToken(params, cancelTokenSource.token)

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else if (apiResponse.status === 200 && apiResponse.data) {
          token = apiResponse.data

          this.updateTask({
            ...this.activeTask(task),
            transactionData: {
              ...this.activeTask(task).transactionData,
              token: token
            }
          })

          break
        } else {
          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
          })

          continue
        }
      }

      callback(token)
    },

    /**
     * Fetch customer profile.
     *
     * @param {*} task
     * @param {*} token
     * @param {*} callback
     */
    async getProfile (task, token, callback) {
      let user = this.activeTask(task).transactionData.user || {}
      let authorized = true

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Fetching profile...`
      })

      while (!Object.keys(user).length && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        }

        const cancelTokenSource = axios.CancelToken.source()

        this.updateTask({
          ...this.activeTask(task),
          cancelTokenSource: cancelTokenSource
        })

        const params = {
          token: token
        }

        if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
          params.proxy = this.getProxy(this.activeTask(task))
        }

        const apiResponse = await customerApi.profile(params, cancelTokenSource.token)

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else if (apiResponse.status === 200 && Object.keys(apiResponse.data).length && apiResponse.data.addresses.length) {
          user = apiResponse.data

          this.updateTask({
            ...this.activeTask(task),
            transactionData: {
              ...this.activeTask(task).transactionData,
              user: user
            }
          })

          break
        } else if (apiResponse.status === 401) {
          authorized = false

          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Unauthorized!`
          })

          break
        } else {
          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
          })

          continue
        }
      }

      callback(user, authorized)
    },

    /**
     * Create cart instance.
     *
     * @param {*} task
     * @param {*} user
     * @param {*} callback
     */
    async createCart (task, user, callback) {
      let cartId = null
      let authorized = true

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Creating cart...`
      })

      while (!cartId && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        }

        const cancelTokenSource = axios.CancelToken.source()

        this.updateTask({
          ...this.activeTask(task),
          cancelTokenSource: cancelTokenSource
        })

        const params = {
          token: user.token
        }

        if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
          params.proxy = this.getProxy(this.activeTask(task))
        }

        const apiResponse = await cartApi.create(params, cancelTokenSource.token)

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else if (apiResponse.status === 200 && apiResponse.data) {
          cartId = apiResponse.data
          break
        } else if (apiResponse.status === 401) {
          authorized = false

          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Unauthorized!`
          })

          break
        } else {
          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
          })

          continue
        }
      }

      callback(cartId, authorized)
    },

    /**
     * Fetch customer cart.
     *
     * @param {*} task
     * @param {*} user
     * @param {*} callback
     */
    async getCart (task, user, callback) {
      let cart = {}
      let authorized = true

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Fetching cart...`
      })

      while (!Object.keys(cart).length && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        }

        const cancelTokenSource = axios.CancelToken.source()

        this.updateTask({
          ...this.activeTask(task),
          cancelTokenSource: cancelTokenSource
        })

        const params = {
          token: user.token
        }

        if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
          params.proxy = this.getProxy(this.activeTask(task))
        }

        const apiResponse = await cartApi.get(params, cancelTokenSource.token)

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else if (apiResponse.status === 200 && Object.keys(apiResponse.data).length) {
          cart = apiResponse.data
          break
        } else if (apiResponse.status === 401) {
          authorized = false

          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Unauthorized!`
          })

          break
        } else {
          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
          })

          continue
        }
      }

      callback(cart, authorized)
    },

    /**
     * Remove existing items in cart.
     *
     * @param {*} task
     * @param {*} cart
     * @param {*} user
     * @param {*} callback
     */
    async cleanCart (task, cart, user, callback) {
      let success = false
      const responses = []
      let authorized = true

      if (!cart.items.length) {
        success = true
        callback(success, authorized)
      } else {
        this.updateTask({
          ...this.activeTask(task),
          logs: `${this.activeTask(task).logs || ''};Cleaning cart...`
        })

        while (!success && this.isRunning(task.id)) {
          for (let index = 0; index < cart.items.length; index++) {
            if (!this.isRunning(task.id)) {
              this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
              break
            }

            await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

            if (!this.isRunning(task.id)) {
              this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
              break
            }

            const cancelTokenSource = axios.CancelToken.source()

            this.updateTask({
              ...this.activeTask(task),
              cancelTokenSource: cancelTokenSource
            })

            const params = {
              token: user.token,
              id: cart.items[index].item_id
            }

            if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
              params.proxy = this.getProxy(this.activeTask(task))
            }

            const apiResponse = await cartApi.delete(params, cancelTokenSource.token)

            if (!this.isRunning(task.id)) {
              this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
              break
            } else if (apiResponse.status === 200 && apiResponse.data) {
              responses.push(apiResponse.data)
            } else if (apiResponse.status === 401) {
              authorized = false

              this.updateTask({
                ...this.activeTask(task),
                logs: `${this.activeTask(task).logs || ''};Unauthorized!`
              })

              break
            } else {
              this.updateTask({
                ...this.activeTask(task),
                logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
              })

              continue
            }
          }

          if (responses.length === cart.items.length && !responses.includes(false)) success = true
        }

        callback(success, authorized)
      }
    },

    /**
     * Add item to cart.
     *
     * @param {*} task
     * @param {*} cart
     * @param {*} user
     * @param {*} callback
     */
    async addItemToCart (task, cart, user, callback) {
      let response = {}
      let authorized = true

      while (!Object.keys(response).length && this.isRunning(task.id)) {
        for (var i = 0; i < this.activeTask(task).sizes.length; ++i) {
          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          }

          await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

          const order = {
            cartItem: {
              sku: `${this.activeTask(task).sku}-SZ${this.activeTask(task).sizes[i].label.replace('.', 'P').toUpperCase()}`,
              qty: this.activeTask(task).qty || 1,
              quote_id: cart.id.toString(),
              product_option: {
                extension_attributes: {
                  configurable_item_options: [
                    {
                      option_id: this.activeTask(task).sizes[i].attribute_id.toString(),
                      option_value: parseInt(this.activeTask(task).sizes[i].value)
                    }
                  ]
                }
              },
              product_type: 'configurable'
            }
          }

          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          } else {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${this.activeTask(task).sizes[i].label} - trying`, 'orange')
          }

          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.activeTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const params = {
            token: user.token,
            payload: order
          }

          if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
            params.proxy = this.getProxy(this.activeTask(task))
          }

          const apiResponse = await cartApi.store(params, cancelTokenSource.token)

          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          } else if (apiResponse.status === 200 && Object.keys(apiResponse.data).length) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${this.activeTask(task).sizes[i].label} - carted`, 'orange')

            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};size: ${this.activeTask(task).sizes[i].label} - carted!`
            })

            response = {
              ...apiResponse.data,
              sizeLabel: this.activeTask(task).sizes[i].label
            }

            break
          } else if (apiResponse.status === 401) {
            authorized = false

            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Unauthorized!`
            })

            break
          } else {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
            })

            continue
          }
        }

        if (Object.keys(response).length) break
      }

      callback(response, authorized)
    },

    /**
     * Set shipping info.
     *
     * @param {*} task
     * @param {*} user
     * @param {*} product
     * @param {*} callback
     */
    async setShippingInfo (task, user, product, callback) {
      const defaultShippingAddress = user.profile.addresses.find((val) => val.default_shipping)
      const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

      let shippingInfo = {}

      let isAuthorized = true

      await this.getEstimateShipping(product, defaultShippingAddress, task, user, (response, authorized) => {
        isAuthorized = authorized
        shippingInfo = response
      })

      const shippingAddress = this.setAddresses(defaultShippingAddress, user)
      const billingAddress = this.setAddresses(defaultBillingAddress, user)

      const shippingParams = {
        addressInformation: {
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          shipping_carrier_code: shippingInfo.carrier_code,
          shipping_method_code: shippingInfo.method_code
        }
      }

      let shipping = {}

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Setting shipping details...`
      })

      while (!Object.keys(shipping).length && this.isRunning(task.id) && isAuthorized) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        }

        this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'set shipping info', 'orange')

        const cancelTokenSource = axios.CancelToken.source()

        this.updateTask({
          ...this.activeTask(task),
          cancelTokenSource: cancelTokenSource
        })

        const params = {
          token: user.token,
          payload: shippingParams
        }

        if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
          params.proxy = this.getProxy(this.activeTask(task))
        }

        const cartApiResponse = await cartApi.setShippingInformation(params, cancelTokenSource.token)

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else if (cartApiResponse.status === 200 && cartApiResponse.data.payment_methods.length) {
          shipping = cartApiResponse.data
          break
        } else if (cartApiResponse.status === 401) {
          isAuthorized = false

          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Unauthorized!`
          })

          break
        } else {
          this.updateTask({
            ...this.activeTask(task),
            logs: `${this.activeTask(task).logs || ''};Request failed - ${cartApiResponse.status}`
          })

          continue
        }
      }

      callback(shipping, isAuthorized)
    },

    /**
     * Get estimate shipping.
     *
     * @param {*} product
     * @param {*} defaultShippingAddress
     * @param {*} task
     * @param {*} user
     * @param {*} callback
     */
    async getEstimateShipping (product, defaultShippingAddress, task, user, callback) {
      let shippingInfo = {
        carrier_code: 'freeshipping',
        method_code: 'freeshipping'
      }

      let authorized = true

      if (product.price <= 7000) {
        this.updateTask({
          ...this.activeTask(task),
          logs: `${this.activeTask(task).logs || ''};Estimating shipping...`
        })

        const estimateParams = { addressId: defaultShippingAddress.id }

        let success = false

        while (!success && this.isRunning(task.id)) {
          await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          } else {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'estimate shipping', 'orange')
          }

          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.activeTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const params = {
            token: user.token,
            payload: estimateParams
          }

          if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
            params.proxy = this.getProxy(this.activeTask(task))
          }

          const apiResponse = await cartApi.estimateShipping(params, cancelTokenSource.token)

          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          } else if (apiResponse.status === 200 && apiResponse.data.length) {
            shippingInfo = apiResponse.data[0]
            success = true
            break
          } else if (apiResponse.status === 401) {
            authorized = false

            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Unauthorized!`
            })

            break
          } else {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Request failed - ${apiResponse.status}`
            })

            continue
          }
        }
      }

      callback(shippingInfo, authorized)
    },

    /**
     * Set addresses parameters.
     *
     * @param {*} address
     * @param {*} user
     */
    setAddresses (address, user) {
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
        email: user.profile.email,
        telephone: address.telephone
      }
    },

    /**
     * Place order.
     *
     * @param {*} task
     * @param {*} shippingData
     * @param {*} user
     * @param {*} cartData
     */
    async placeOrder (task, shippingData, user, cartData, productData) {
      const vm = this

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Waiting to place order...`
      })

      await this.timer(task, productData.sizeLabel, async (response) => {
        if (response && vm.isRunning(task.id)) {
          const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

          const params = {
            payload: {
              amcheckout: {},
              billingAddress: this.setAddresses(defaultBillingAddress, user),
              cartId: cartData.id.toString(),
              paymentMethod: {
                additional_data: null,
                method: '',
                po_number: null
              }
            },
            token: user.token
          }

          switch (shippingData.payment_methods.slice().find((val) => val.code).code) {
            case 'paymaya_checkout':
              params.payload.paymentMethod.method = 'paymaya_checkout'

              vm.updateTask({
                ...vm.activeTask(task),
                transactionData: {
                  ...vm.activeTask(task).transactionData,
                  method: 'PayMaya'
                }
              })

              vm.paymayaCheckout(task, shippingData, productData, params)

              break

            case 'ccpp':
              params.payload.paymentMethod.method = 'ccpp'

              vm.updateTask({
                ...vm.activeTask(task),
                transactionData: {
                  ...vm.activeTask(task).transactionData,
                  method: '2c2p'
                }
              })

              vm.creditCardCheckout(task, shippingData, productData, params)

              break

            case 'braintree_paypal':
              params.payload.paymentMethod.method = 'braintree_paypal'

              if (vm.activeTask(task).profile.paypal && Object.keys(vm.activeTask(task).profile.paypal).length) {
                params.payload.paymentMethod.additional_data = {
                  paypal_express_checkout_token: vm.activeTask(task).profile.paypal.paypalAccounts[0].details.correlationId,
                  paypal_express_checkout_redirect_required: false,
                  paypal_express_checkout_payer_id: vm.activeTask(task).profile.paypal.paypalAccounts[0].details.payerInfo.payerId,
                  payment_method_nonce: vm.activeTask(task).profile.paypal.paypalAccounts[0].nonce
                }
              } else if (vm.paypal && Object.keys(vm.paypal).length) {
                params.payload.paymentMethod.additional_data = {
                  paypal_express_checkout_token: vm.paypal.paypalAccounts[0].details.correlationId,
                  paypal_express_checkout_redirect_required: false,
                  paypal_express_checkout_payer_id: vm.paypal.paypalAccounts[0].details.payerInfo.payerId,
                  payment_method_nonce: vm.paypal.paypalAccounts[0].nonce
                }
              }

              vm.updateTask({
                ...vm.activeTask(task),
                transactionData: {
                  ...vm.activeTask(task).transactionData,
                  method: 'PayPal'
                }
              })

              vm.paypalCheckout(task, shippingData, productData, params)

              break

            default:
              vm.init(vm.activeTask(task))
              break
          }
        } else {
          vm.init(vm.activeTask(task))
        }
      })
    },

    /**
     * Trigger timer, wait to proceed.
     *
     * @param {*} task
     * @param {*} sizeLabel
     * @param {*} callback
     */
    timer (task, sizeLabel, callback) {
      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${sizeLabel} - waiting to place order`, 'orange')

      let proceed = false
      const vm = this

      const loop = setInterval(function () {
        if (!vm.isRunning(task.id)) {
          vm.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          clearInterval(loop)
          callback(proceed)
        } else {
          if (vm.activeTask(task).placeOrder) {
            const timer = vm.$moment(`${vm.$moment().format('YYYY-MM-DD')} ${vm.activeTask(task).placeOrder}`).format('HH:mm:ss')
            const current = vm.$moment().format('HH:mm:ss')

            if (current >= timer) {
              vm.updateTask({
                ...vm.activeTask(task),
                placeOrder: ''
              })

              proceed = true
              clearInterval(loop)
              callback(proceed)
            }
          } else {
            proceed = true
            clearInterval(loop)
            callback(proceed)
          }
        }
      }, 1000)
    },

    /**
     * PayMaya Checkout order
     *
     * @param {*} task
     * @param {*} shippingData
     * @param {*} productData
     * @param {*} params
     */
    async paymayaCheckout (task, shippingData, productData, params) {
      if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
        params.proxy = this.getProxy(this.activeTask(task))
      }

      let orderResult = {}
      const tries = 3

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Placing order...`
      })

      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${productData.sizeLabel} - placing order`, 'orange')

      for (let index = 1; index <= tries; index++) {
        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else {
          const sw = new StopWatch(true)

          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.activeTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const apiResponse = await orderApi.placePaymayaOrder(params, cancelTokenSource.token)

          sw.stop()

          if (apiResponse.status === 200 && this.isRunning(task.id)) {
            orderResult = apiResponse.data
            orderResult.time = (sw.read() / 1000.0).toFixed(2)
            orderResult.order = productData

            this.onSuccess(task, orderResult, shippingData, productData)

            break
          } else if (index === tries) {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Trying for restock!`
            })

            this.init(this.activeTask(task))
            break
          } else {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Out of stock!`
            })

            await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

            continue
          }
        }
      }
    },

    /**
     * 2c2p Checkout order
     *
     * @param {*} task
     * @param {*} shippingData
     * @param {*} productData
     * @param {*} params
     */
    async creditCardCheckout (task, shippingData, productData, params) {
      if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
        params.proxy = this.getProxy(this.activeTask(task))
      }

      let orderResult = {}
      const tries = 3

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Placing order...`
      })

      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${productData.sizeLabel} - placing order`, 'orange')

      for (let index = 1; index <= tries; index++) {
        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else {
          const sw = new StopWatch(true)

          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.activeTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const apiResponse = await orderApi.place2c2pOrder(params, cancelTokenSource.token)

          sw.stop()

          if (apiResponse.status === 200 && apiResponse.data.cookies && this.isRunning(task.id)) {
            orderResult = apiResponse.data
            orderResult.time = (sw.read() / 1000.0).toFixed(2)
            orderResult.order = productData

            this.onSuccess(task, orderResult, shippingData, productData)

            break
          } else if (index === tries) {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Trying for restock!`
            })

            this.init(this.activeTask(task))
            break
          } else {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Out of stock!`
            })

            await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

            continue
          }
        }
      }
    },

    /**
     * PayPal Checkout order
     *
     * @param {*} task
     * @param {*} shippingData
     * @param {*} productData
     * @param {*} params
     */
    async paypalCheckout (task, shippingData, productData, params) {
      if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
        params.proxy = this.getProxy(this.activeTask(task))
      }

      let orderResult = {}
      const tries = 3

      this.updateTask({
        ...this.activeTask(task),
        logs: `${this.activeTask(task).logs || ''};Placing order...`
      })

      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${productData.sizeLabel} - placing order`, 'orange')

      for (let index = 1; index <= tries; index++) {
        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else {
          const sw = new StopWatch(true)

          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.activeTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const apiResponse = await cartApi.paymentInformation(params, cancelTokenSource.token)

          sw.stop()

          if (apiResponse.status === 200 && this.isRunning(task.id)) {
            orderResult = apiResponse.data
            orderResult.time = (sw.read() / 1000.0).toFixed(2)
            orderResult.order = productData

            this.onSuccess(task, orderResult, shippingData, productData)

            break
          } else if (index === tries) {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Trying for restock!`
            })

            this.init(this.activeTask(task))
            break
          } else {
            this.updateTask({
              ...this.activeTask(task),
              logs: `${this.activeTask(task).logs || ''};Out of stock!`
            })

            await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

            continue
          }
        }
      }
    },

    /**
     * Trigger on success event.
     *
     * @param {*} task
     * @param {*} transactionData
     * @param {*} shippingData
     * @param {*} time
     */
    async onSuccess (task, orderResult, shippingData, productData) {
      this.updateTask({
        ...this.activeTask(task),
        transactionData: {
          ...orderResult,
          ...this.activeTask(task).transactionData
        },
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'copped!',
          class: 'success'
        },
        logs: `${this.activeTask(task).logs || ''};Copped!`
      })

      if (this.settings.autoPay && !this.activeTask(task).aco) {
        switch (this.activeTask(task).transactionData.method) {
          case '2c2p':
            ipcRenderer.send('pay-with-2c2p', JSON.stringify({ task: task, settings: this.settings }))
            break

          case 'PayMaya':
            ipcRenderer.send('pay-with-paymaya', JSON.stringify({ task: task, settings: this.settings }))
            break
        }
      }

      if (this.settings.sound) {
        const sound = new Howl({
          src: [SuccessEffect]
        })

        sound.play()
      }

      this.$toast.open({
        message: '<strong style="font-family: Arial; text-transform: uppercase">checked out</strong>',
        type: 'success',
        duration: 3000
      })

      const url = this.settings.webhook
      const productName = shippingData.totals.items[0].name
      const productSize = productData.sizeLabel
      const profile = this.activeTask(task).profile.name
      const secs = orderResult.time
      const sku = this.activeTask(task).sku
      const method = this.activeTask(task).transactionData.method
      let img = ''
      const checkoutLink = (this.activeTask(task).transactionData.method === 'PayMaya') ? orderResult.request.uri.href : ''

      const params = {
        payload: {
          searchCriteria: {
            filterGroups: [
              {
                filters: [
                  {
                    field: 'sku',
                    value: sku
                  }
                ]
              }
            ]
          }
        },
        token: Config.services.titan22.token
      }

      if (this.activeTask(task).proxy && Object.keys(this.activeTask(task).proxy).length && this.activeTask(task).proxy.proxies.length) {
        params.proxy = this.getProxy(this.activeTask(task))
      }

      const apiResponse = await productApi.search(params)

      try {
        const image = apiResponse.data.items[0].custom_attributes.find((val) => val.attribute_code === 'image')
        img = `${Config.services.titan22.url}/media/catalog/product${image.value}`
      } catch (error) {
        img = ''
      }

      if (this.settings.webhook) {
        // send to personal webhook
        this.sendWebhook(url, productName, productSize, profile, secs, sku, null, method, img, this.activeTask(task).proxy, checkoutLink)

        // send to public webhook
        if (this.settings.webhook !== Config.bot.webhook) this.sendWebhook(Config.bot.webhook, productName, productSize, null, secs, sku, null, method, img)
      } else {
        // send to public webhook
        this.sendWebhook(Config.bot.webhook, productName, productSize, null, secs, sku, null, method, img)
      }

      if (this.activeTask(task).transactionData.method === '2c2p') {
        const cookie = orderResult.cookies.value

        // send to aco webhook
        if (this.activeTask(task).aco && this.activeTask(task).webhook) this.sendWebhook(this.activeTask(task).webhook, productName, productSize, profile, secs, sku, cookie, method, img, checkoutLink)
      }
    }
  }
}
