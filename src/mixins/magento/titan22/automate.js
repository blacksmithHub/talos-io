import { mapState, mapActions } from 'vuex'
import { Howl } from 'howler'
import { ipcRenderer } from 'electron'

import StopWatch from 'statman-stopwatch'

import SuccessEffect from '@/assets/success.mp3'

import Constant from '@/config/constant'
import Config from '@/config/app'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import orderApi from '@/api/magento/titan22/order'
import productApi from '@/api/magento/titan22/product'

import webhook from '@/mixins/webhook'

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
    ...mapState('paypal', { paypal: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),

    /**
     * Identify task status
     *
     * @param {*} id
     */
    isRunning (id) {
      const task = this.getCurrentTask(id)

      return task && task.status.id === Constant.TASK.STATUS.RUNNING
    },

    /**
     * Return current task
     *
     * @param {*} id
     */
    getCurrentTask (id) {
      const task = this.tasks.find((data) => data.id === id)

      return task
    },

    /**
     * Remove task timer
     *
     * @param {*} id
     */
    removeTimer (id) {
      const task = this.getCurrentTask(id)

      if (task) {
        task.placeOrder = null

        this.updateTask(task)
      }
    },

    /**
     * Set status of current task
     *
     * @param {*} id
     * @param {*} status
     * @param {*} msg
     * @param {*} attr
     */
    setCurrentTaskStatus (id, status, msg, attr) {
      const task = this.getCurrentTask(id)

      if (task) {
        task.status = {
          id: status,
          msg: msg,
          class: attr
        }

        this.updateTask(task)
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
     * Update logs of current task
     *
     * @param {*} id
     * @param {*} msg
     */
    updateCurrentTaskLog (id, msg) {
      const task = this.getCurrentTask(id)

      if (task) {
        task.logs = `${task.logs || ''};[${this.$moment().format('YYYY-MM-DD h:mm:ss a')}]: ${msg}`

        this.updateTask(task)
      }
    },

    /**
     * Handle API error responses
     *
     * @param {*} id
     * @param {*} counter
     * @param {*} response
     */
    async handleError (id, counter, response, attr = 'orange') {
      try {
        try {
          if (response.error) {
            await this.updateCurrentTaskLog(id, `#${counter}: ${response.error.message}`)
          } else if (response.body) {
            await this.updateCurrentTaskLog(id, `#${counter}: ${response.statusCode} - ${JSON.parse(response.body).message}`)
          } else {
            await this.updateCurrentTaskLog(id, `#${counter}: ${response}`)
          }
        } catch (error) {
          await this.updateCurrentTaskLog(id, `#${counter}: ${error}`)
        }

        switch (response.statusCode) {
          case 401:
            {
              let currentTask = await this.getCurrentTask(id)
              if (currentTask) {
                const token = await this.authenticate(currentTask, attr)
                currentTask = await this.getCurrentTask(id)
                if (token && currentTask) {
                  currentTask.transactionData.token = token
                  this.updateTask(currentTask)
                }
              }
            }
            break
        }
      } catch (error) {
        this.updateCurrentTaskLog(id, `#${counter}: ${error}`)
      }
    },

    /**
     * Perform verify automation
     *
     * @param {*} task
     */
    async verify (task) {
      if (!this.isRunning(task.id)) return false

      /**
       * Step 1: authenticate
       *
       * get user token
       */
      if (this.isRunning(task.id)) {
        const token = await this.authenticate(task, 'cyan')

        if (this.isRunning(task.id)) {
          const currentTask = await this.getCurrentTask(task.id)

          if (token && currentTask) {
            currentTask.transactionData.token = token
            task.transactionData.token = token
            await this.updateTask(currentTask)
          } else {
            this.verify(task)
            return false
          }
        }
      }

      /**
       * Step 2: get account
       *
       * get account data
       */
      if (this.isRunning(task.id)) {
        const account = await this.getAccount(task, 'cyan')

        if (this.isRunning(task.id)) {
          const currentTask = await this.getCurrentTask(task.id)

          if (account && currentTask) {
            currentTask.transactionData.account = account
            task.transactionData.account = account
            await this.updateTask(currentTask)
          } else {
            this.verify(task)
            return false
          }
        }
      }

      /**
       * Step 3: initialize cart
       *
       * create, get, and clean cart
       */
      if (this.isRunning(task.id)) {
        const cart = await this.initializeCart(task, 'cyan')

        if (this.isRunning(task.id)) {
          const currentTask = await this.getCurrentTask(task.id)

          if (cart && currentTask) {
            currentTask.transactionData.cart = cart
            await this.updateTask(currentTask)
            await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'ready', 'light-blue')
            return true
          } else {
            this.verify(task)
            return false
          }
        }
      }

      return false
    },

    /**
     * Perform start automation
     *
     * @param {*} task
     */
    async start (task) {
      if (!this.isRunning(task.id)) return false

      /**
       * Step 1: authenticate
       *
       * get user token
       */
      if (this.isRunning(task.id)) {
        let token = null
        const currentTask = await this.getCurrentTask(task.id)

        if (currentTask && currentTask.transactionData.token) {
          token = currentTask.transactionData.token
        } else {
          token = await this.authenticate(task)
        }

        if (this.isRunning(task.id)) {
          if (token) {
            task.transactionData.token = token
          } else {
            this.start(task)
            return false
          }
        }
      }

      /**
       * Step 2: get account
       *
       * get account data
       */
      if (this.isRunning(task.id)) {
        let account = null
        const currentTask = await this.getCurrentTask(task.id)

        if (currentTask && currentTask.transactionData.account) {
          account = currentTask.transactionData.account
        } else {
          account = await this.getAccount(task)
        }

        if (this.isRunning(task.id)) {
          if (account) {
            task.transactionData.account = account
          } else {
            this.start(task)
            return false
          }
        }
      }

      /**
       * Step 3: initialize cart
       *
       * create, get, and clean cart
       */
      if (this.isRunning(task.id)) {
        let cart = null
        const currentTask = await this.getCurrentTask(task.id)

        if (currentTask && currentTask.transactionData.cart) {
          cart = currentTask.transactionData.cart
        } else {
          cart = await this.initializeCart(task)
        }

        if (this.isRunning(task.id)) {
          if (cart) {
            task.transactionData.cart = cart
          } else {
            this.start(task)
            return false
          }
        }
      }

      /**
       * Step 4: add to cart
       *
       * add to cart
       */
      if (this.isRunning(task.id)) {
        if (task.transactionData.cart) {
          const product = await this.addToCart(task)

          if (this.isRunning(task.id)) {
            if (product) {
              task.transactionData.product = product
            } else {
              this.start(task)
              return false
            }
          }
        } else {
          this.start(task)
          return false
        }
      }

      /**
       * Step 5: set shipping info
       *
       * set shipping details
       */
      if (this.isRunning(task.id)) {
        if (task.transactionData.product) {
          const shipping = await this.setShippingInfo(task)

          if (this.isRunning(task.id)) {
            if (shipping) {
              task.transactionData.shipping = shipping
            } else {
              this.start(task)
              return false
            }
          }
        } else {
          this.start(task)
          return false
        }
      }

      /**
       * Step 6: place order
       *
       * place order
       */
      if (this.isRunning(task.id)) {
        if (task.transactionData.shipping) {
          const order = await this.placeOrder(task)

          if (order) {
            await this.onSuccess(task)
            return true
          } else {
            if (this.isRunning(task.id)) {
              await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'cleaning cart', 'orange')

              const cart = await this.getCart(task.id)

              if (this.isRunning(task.id)) {
                const currentTask = await this.getCurrentTask(task.id)
                currentTask.transactionData.cart = cart
                await this.updateTask(currentTask)
                this.start(task)
                return false
              }
            }
          }
        } else {
          this.start(task)
          return false
        }
      }

      return false
    },

    /**
     * Perform login
     *
     * @param {*} task
     */
    async authenticate (task, attr = 'orange') {
      await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'authenticating', attr)

      let data = null
      let counter = 0

      while (this.isRunning(task.id) && !data) {
        counter++

        try {
          let currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

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

          if (!this.isRunning(task.id)) break

          await this.updateCurrentTaskLog(task.id, `#${counter}: Logging in...`)

          currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

          const params = {
            payload: {
              username: currentTask.profile.email,
              password: currentTask.profile.password
            },
            proxy: currentTask.proxy,
            mode: currentTask.mode,
            taskId: task.id
          }

          const response = await authApi.fetchToken(params)

          if (!this.isRunning(task.id)) break

          if (response && response.error) {
            await this.handleError(task.id, counter, response.error, attr)
            continue
          } else if (response && !response.error) {
            data = response
            break
          }
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
          continue
        }
      }

      return data
    },

    /**
     * Fetch user account
     *
     * @param {*} task
     */
    async getAccount (task, attr = 'orange') {
      let data = null
      let counter = 0

      while (this.isRunning(task.id) && !data) {
        counter++

        try {
          let currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

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

          if (!this.isRunning(task.id)) break

          await this.updateCurrentTaskLog(task.id, `#${counter}: Fetching account...`)

          currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

          const params = {
            token: task.transactionData.token,
            proxy: currentTask.proxy,
            mode: currentTask.mode,
            taskId: task.id
          }

          const response = await customerApi.profile(params)

          if (!this.isRunning(task.id)) break

          if (response && response.error) {
            await this.handleError(task.id, counter, response.error, attr)
            continue
          } else if (response && !response.error && response.addresses.length) {
            data = response
            break
          }
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
          continue
        }
      }

      return data
    },

    /**
     * Perform Create, get, and clean cart
     *
     * @param {*} task
     */
    async initializeCart (task, attr = 'orange') {
      await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'initializing cart', attr)

      const cartId = await this.createCart(task, attr)

      let cart = null

      if (cartId) {
        cart = await this.getCart(task, attr)
      }

      return cart
    },

    /**
     * Perform cart creation
     *
     * @param {*} task
     */
    async createCart (task, attr = 'orange') {
      let data = null
      let counter = 0

      while (this.isRunning(task.id) && !data) {
        counter++

        try {
          let currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

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

          currentTask = await this.getCurrentTask(task.id)

          if (!this.isRunning(task.id) || !currentTask) break

          await this.updateCurrentTaskLog(task.id, `#${counter}: Creating cart...`)

          const params = {
            token: task.transactionData.token,
            proxy: currentTask.proxy,
            mode: currentTask.mode,
            taskId: task.id
          }

          const response = await cartApi.create(params)

          if (!this.isRunning(task.id)) break

          if (response && response.error) {
            await this.handleError(task.id, counter, response.error, attr)
            continue
          } else if (response && !response.error) {
            data = response
            break
          }
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
          continue
        }
      }

      return data
    },

    /**
     * Fetch and clean current cart
     *
     * @param {*} task
     */
    async getCart (task, attr = 'orange') {
      let data = null
      let counter = 0

      while (this.isRunning(task.id) && !data) {
        counter++

        try {
          let currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

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

          currentTask = await this.getCurrentTask(task.id)

          if (!this.isRunning(task.id) || !currentTask) break

          await this.updateCurrentTaskLog(task.id, `#${counter}: Fetching cart...`)

          const params = {
            token: task.transactionData.token,
            proxy: currentTask.proxy,
            mode: currentTask.mode,
            taskId: task.id
          }

          const response = await cartApi.get(params)

          if (!this.isRunning(task.id)) break

          if (response && response.error) {
            await this.handleError(task.id, counter, response.error, attr)
            continue
          } else if (response && !response.error) {
            data = response
            break
          }
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
          continue
        }
      }

      // Clean cart
      if (this.isRunning(task.id) && data && data.items.length) {
        counter = 0

        for (let index = 0; index < data.items.length; index++) {
          let deleted = false

          while (this.isRunning(task.id) && !deleted) {
            counter++

            try {
              let currentTask = await this.getCurrentTask(task.id)

              if (!currentTask) break

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

              if (!this.isRunning(task.id)) break

              await this.updateCurrentTaskLog(task.id, `#${counter}: Cleaning cart - item ${index + 1}...`)

              currentTask = await this.getCurrentTask(task.id)

              if (!currentTask) break

              const params = {
                token: task.transactionData.token,
                id: data.items[index].item_id,
                proxy: currentTask.proxy,
                mode: currentTask.mode,
                taskId: task.id
              }

              const response = await cartApi.delete(params)

              if (!this.isRunning(task.id)) break

              if (response && response.error) {
                await this.handleError(task.id, counter, response.error)
                continue
              } else if (response && !response.error) {
                deleted = response
                continue
              }
            } catch (error) {
              await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
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
     * @param {*} task
     */
    async addToCart (task) {
      let data = null
      let counter = 0

      while (this.isRunning(task.id) && !data) {
        counter++

        try {
          let currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

          for (let index = 0; index < currentTask.sizes.length; index++) {
            try {
              currentTask = this.getCurrentTask(task.id)

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

              currentTask = await this.getCurrentTask(task.id)

              if (!this.isRunning(task.id) || !currentTask) break

              const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - trying`
              await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
              await this.updateCurrentTaskLog(task.id, `#${counter}: ${msg}`)

              currentTask = await this.getCurrentTask(task.id)

              if (!currentTask) break

              const params = {
                token: task.transactionData.token,
                payload: {
                  cartItem: {
                    sku: `${currentTask.sku}-SZ${currentTask.sizes[index].label.replace('.', 'P').toUpperCase()}`,
                    qty: currentTask.qty || 1,
                    quote_id: task.transactionData.cart.id.toString(),
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
                taskId: task.id
              }

              const response = await cartApi.store(params)

              if (!this.isRunning(task.id)) break

              if (response && response.error) {
                await this.handleError(task.id, counter, response.error)
                continue
              } else if (response && !response.error) {
                currentTask = await this.getCurrentTask(task.id)

                if (currentTask) {
                  data = response
                  data.size = currentTask.sizes[index].label.toUpperCase()

                  const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - carted`
                  await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
                  await this.updateCurrentTaskLog(task.id, `#${counter}: ${msg}`)

                  break
                } else {
                  continue
                }
              }
            } catch (error) {
              await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
              continue
            }
          }
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
          continue
        }
      }

      return data
    },

    /**
     * Perform setting of shipping information
     *
     * @param {*} task
     */
    async setShippingInfo (task) {
      let data = null
      let counter = 0

      const defaultShippingAddress = task.transactionData.account.addresses.find((val) => val.default_shipping)
      const defaultBillingAddress = task.transactionData.account.addresses.find((val) => val.default_billing)

      let currentTask = await this.getCurrentTask(task.id)

      if (!currentTask) return data

      // estimate shipping
      let params = null

      if (task.transactionData.product.price <= 7000) {
        while (this.isRunning(task.id) && !params) {
          counter++

          try {
            currentTask = await this.getCurrentTask(task.id)

            if (!currentTask) break

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

            currentTask = await this.getCurrentTask(task.id)

            if (!this.isRunning(task.id) || !currentTask) break

            const waitingMsg = `Size: ${task.transactionData.product.size} - estimating shipping`
            await this.updateCurrentTaskLog(task.id, `#${counter}: ${waitingMsg}`)
            await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')

            currentTask = await this.getCurrentTask(task.id)

            if (!currentTask) break

            const parameters = {
              token: task.transactionData.token,
              payload: { addressId: defaultShippingAddress.id },
              proxy: currentTask.proxy,
              mode: currentTask.mode,
              taskId: task.id
            }

            const response = await cartApi.estimateShipping(parameters)

            if (!this.isRunning(task.id)) break

            if (response && response.error) {
              await this.handleError(task.id, counter, response.error)
              continue
            } else if (response && !response.error) {
              params = response[0]
              break
            }
          } catch (error) {
            await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
            continue
          }
        }
      } else {
        params = {
          carrier_code: 'freeshipping',
          method_code: 'freeshipping'
        }
      }

      if (!this.isRunning(task.id)) return data

      const email = task.transactionData.account.email

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

      while (this.isRunning(task.id) && !data) {
        counter++

        try {
          const waitingMsg = `Size: ${task.transactionData.product.size} - setting shipping details`
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${waitingMsg}`)
          await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')

          currentTask = await this.getCurrentTask(task.id)

          if (!currentTask) break

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

          currentTask = await this.getCurrentTask(task.id)

          if (!this.isRunning(task.id) || !currentTask) break

          const params = {
            token: task.transactionData.token,
            payload: payload,
            proxy: currentTask.proxy,
            mode: currentTask.mode,
            taskId: task.id
          }

          const response = await cartApi.setShippingInformation(params)

          if (!this.isRunning(task.id)) break

          if (response && response.error) {
            await this.handleError(task.id, counter, response.error)
            continue
          } else if (response && !response.error) {
            data = response
            break
          }
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, `#${counter}: ${error}`)
          continue
        }
      }

      return data
    },

    /**
     * Perform placing of order
     *
     * @param {*} task
     */
    async placeOrder (task) {
      let data = null

      try {
        let currentTask = await this.getCurrentTask(task.id)

        if (!this.isRunning(task.id) || !currentTask) return data

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

        const waitingMsg = `Size: ${task.transactionData.product.size} - waiting to place order`
        await this.updateCurrentTaskLog(task.id, waitingMsg)
        await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')

        if (currentTask.placeOrder) {
          let interval = null
          let timeout = null
          const vm = this
          await new Promise((resolve) => {
            interval = setInterval(() => {
              const now = new Date()
              const then = new Date(vm.$moment(currentTask.placeOrder, 'HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'))
              timeout = setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, then - now)
            }, 500)
          })
          clearInterval(interval)
          clearTimeout(timeout)
        }

        if (!this.isRunning(task.id)) return data

        const placingMsg = `Size: ${task.transactionData.product.size} - placing order`
        await this.updateCurrentTaskLog(task.id, placingMsg)
        await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, placingMsg, 'orange')

        const defaultBillingAddress = task.transactionData.account.addresses.find((val) => val.default_billing)

        const payload = {
          payload: {
            amcheckout: {},
            billingAddress: this.setAddresses(defaultBillingAddress, task.transactionData.account.email),
            cartId: task.transactionData.cart.id.toString(),
            paymentMethod: {
              additional_data: null,
              method: '',
              po_number: null
            }
          },
          token: task.transactionData.token,
          proxy: currentTask.proxy,
          mode: currentTask.mode,
          taskId: task.id
        }

        currentTask = await this.getCurrentTask(task.id)

        if (!currentTask) return data

        switch (currentTask.checkoutMethod) {
          case 1:
            payload.payload.paymentMethod.method = 'paymaya_checkout'
            data = await this.paymayaCheckout(task, payload)
            break

          case 2:
            payload.payload.paymentMethod.method = 'ccpp'
            data = await this.creditCardCheckout(task, payload)
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
            } else if (this.paypal && Object.keys(this.paypal).length) {
              payload.payload.paymentMethod.additional_data = {
                paypal_express_checkout_token: this.paypal.paypalAccounts[0].details.correlationId,
                paypal_express_checkout_redirect_required: false,
                paypal_express_checkout_payer_id: this.paypal.paypalAccounts[0].details.payerInfo.payerId,
                payment_method_nonce: this.paypal.paypalAccounts[0].nonce
              }
            }

            data = await this.paypalCheckout(task, payload)
            break

          default:
            switch (task.transactionData.shipping.payment_methods.slice().find((val) => val.code).code) {
              case 'paymaya_checkout':
                payload.payload.paymentMethod.method = 'paymaya_checkout'
                data = await this.paymayaCheckout(task, payload)
                break

              case 'ccpp':
                payload.payload.paymentMethod.method = 'ccpp'
                data = await this.creditCardCheckout(task, payload)
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
                } else if (this.paypal && Object.keys(this.paypal).length) {
                  payload.payload.paymentMethod.additional_data = {
                    paypal_express_checkout_token: this.paypal.paypalAccounts[0].details.correlationId,
                    paypal_express_checkout_redirect_required: false,
                    paypal_express_checkout_payer_id: this.paypal.paypalAccounts[0].details.payerInfo.payerId,
                    payment_method_nonce: this.paypal.paypalAccounts[0].nonce
                  }
                }

                data = await this.paypalCheckout(task, payload)

                break
            }
            break
        }
      } catch (error) {
        await this.updateCurrentTaskLog(task.id, error)
      }

      return data
    },

    /**
     * PayMaya checkout method
     *
     * @param {*} task
     * @param {*} payload
     */
    async paymayaCheckout (task, payload) {
      let data = null
      const tries = 3

      for (let index = 1; index <= tries; index++) {
        try {
          if (!this.isRunning(task.id)) break

          if (index > 1) {
            const waitingMsg = `Size: ${task.transactionData.product.size} - retrying`
            await this.updateCurrentTaskLog(task.id, waitingMsg)
            await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')
          }

          let counter = 0

          while (this.isRunning(task.id) && !data) {
            counter++

            const currentTask = await this.getCurrentTask(task.id)

            if (!currentTask) break

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

            if (!this.isRunning(task.id)) break

            const timer = new StopWatch(true)

            const response = await orderApi.placePaymayaOrder(payload)

            timer.stop()

            if (!this.isRunning(task.id)) break

            const speed = (timer.read() / 1000.0).toFixed(2)

            task.transactionData.timer = speed

            if (response && response.error) {
              await this.handleError(task.id, counter, response.error)

              if (response.error.statusCode !== 429) break

              continue
            } else if (response && !response.error && response.request.uri.href) {
              data = response.request.uri.href
              break
            }
          }

          if (data) break
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, error)
          continue
        }
      }

      if (!this.isRunning(task.id)) return null

      if (!data) {
        const msg = `Size: ${task.transactionData.product.size} - out of luck`
        await this.updateCurrentTaskLog(task.id, msg)
        await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
      } else {
        const currentTask = await this.getCurrentTask(task.id)

        if (!currentTask) return null

        const msg = `Size: ${task.transactionData.product.size} - copped!`

        task.transactionData.product.image = await this.searchProduct(task.id)
        task.transactionData.checkoutLink = data
        task.transactionData.method = 'PayMaya'

        currentTask.logs = `${currentTask.logs || ''};${msg}`
        currentTask.status = {
          id: Constant.TASK.STATUS.STOPPED,
          msg: msg,
          class: 'success'
        }

        currentTask.transactionData = {
          ...currentTask.transactionData,
          ...task.transactionData
        }

        await this.updateTask(currentTask)
      }

      return data
    },

    /**
     * 2c2p checkout method
     *
     * @param {*} task
     * @param {*} payload
     */
    async creditCardCheckout (task, payload) {
      let data = null
      const tries = 3

      if (!this.isRunning(task.id)) return data

      for (let index = 1; index <= tries; index++) {
        try {
          if (!this.isRunning(task.id)) break

          if (index > 1) {
            const waitingMsg = `Size: ${task.transactionData.product.size} - retrying`
            await this.updateCurrentTaskLog(task.id, waitingMsg)
            await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')
          }

          let counter = 0

          while (this.isRunning(task.id) && !data) {
            counter++

            const currentTask = this.getCurrentTask(task.id)

            if (!this.isRunning(task.id) || !currentTask) break

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

            if (!this.isRunning(task.id)) break

            const timer = new StopWatch(true)

            const response = await orderApi.place2c2pOrder(payload)

            timer.stop()

            if (!this.isRunning(task.id)) break

            const speed = (timer.read() / 1000.0).toFixed(2)

            task.transactionData.timer = speed

            if (response && response.error) {
              await this.handleError(task.id, counter, response.error)

              if (response.error.statusCode !== 429) break

              continue
            } else if (response && !response.error && response.cookie) {
              data = response
              break
            }
          }

          if (data) break
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, error)
          continue
        }
      }

      if (!this.isRunning(task.id)) return null

      if (!data) {
        const msg = `Size: ${task.transactionData.product.size} - out of luck`
        await this.updateCurrentTaskLog(task.id, msg)
        await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
      } else {
        const currentTask = await this.getCurrentTask(task.id)

        if (!currentTask) return null

        const msg = `Size: ${task.transactionData.product.size} - copped!`

        task.transactionData.product.image = await this.searchProduct(task.id)
        task.transactionData.cookie = data.cookie
        task.transactionData.method = '2c2p'
        task.transactionData.order = data.data

        currentTask.logs = `${currentTask.logs || ''};${msg}`
        currentTask.status = {
          id: Constant.TASK.STATUS.STOPPED,
          msg: msg,
          class: 'success'
        }

        currentTask.transactionData = {
          ...currentTask.transactionData,
          ...task.transactionData
        }

        await this.updateTask(currentTask)
      }

      return data
    },

    /**
     * PayPal checkout method
     *
     * @param {*} task
     * @param {*} payload
     */
    async paypalCheckout (task, payload) {
      let data = null
      const tries = 3

      if (!this.isRunning(task.id)) return data

      for (let index = 1; index <= tries; index++) {
        try {
          if (!this.isRunning(task.id)) break

          if (index > 1) {
            const waitingMsg = `Size: ${task.transactionData.product.size} - retrying`
            await this.updateCurrentTaskLog(task.id, waitingMsg)
            await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')
          }

          let counter = 0

          while (this.isRunning(task.id) && !data) {
            counter++

            const currentTask = await this.getCurrentTask(task.id)

            if (!this.isRunning(task.id) || !currentTask) break

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

            if (!this.isRunning(task.id)) break

            const timer = new StopWatch(true)

            const response = await cartApi.paymentInformation(payload)

            timer.stop()

            if (!this.isRunning(task.id)) break

            const speed = (timer.read() / 1000.0).toFixed(2)

            task.transactionData.timer = speed

            if (response && response.error) {
              await this.handleError(task.id, counter, response.error)

              if (response.error.statusCode !== 429) break

              continue
            } else if (response && !response.error) {
              data = response
              break
            }
          }

          if (data) break
        } catch (error) {
          await this.updateCurrentTaskLog(task.id, error)
          continue
        }
      }

      if (!this.isRunning(task.id)) return null

      if (!data) {
        const msg = `Size: ${task.transactionData.product.size} - out of luck`
        await this.updateCurrentTaskLog(task.id, msg)
        await this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
      } else {
        const currentTask = await this.getCurrentTask(task.id)

        if (!currentTask) return null

        const msg = `Size: ${task.transactionData.product.size} - copped!`

        task.transactionData.product.image = await this.searchProduct(task.id)
        task.transactionData.method = 'PayPal'

        currentTask.logs = `${currentTask.logs || ''};${msg}`
        currentTask.status = {
          id: Constant.TASK.STATUS.STOPPED,
          msg: msg,
          class: 'success'
        }

        currentTask.transactionData = {
          ...currentTask.transactionData,
          ...task.transactionData
        }

        await this.updateTask(currentTask)
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

      const currentTask = this.getCurrentTask(id)

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

      try {
        const image = response.items[0].custom_attributes.find((val) => val.attribute_code === 'image')
        data = `${Config.services.titan22.url}/media/catalog/product${image.value}`
      } catch (error) {
        data = ''
      }

      return data
    },

    /**
     * Perform on success event
     *
     * @param {*} task
     */
    async onSuccess (task) {
      const currentTask = await this.getCurrentTask(task.id)

      delete currentTask.transactionData.cart

      await this.updateTask(currentTask)

      if (this.settings.autoPay && !currentTask.aco) {
        this.redirectToCheckout(currentTask)
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

      const webhook = {
        productName: currentTask.transactionData.product.name,
        productSku: currentTask.transactionData.product.sku,
        productImage: currentTask.transactionData.product.image,
        checkoutMethod: currentTask.transactionData.method,
        checkoutTime: currentTask.transactionData.timer,
        delay: currentTask.delay
      }

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
        this.sendWebhook(acoWebhook)
      }

      await new Promise(resolve => setTimeout(resolve, 3000))

      // send to personal webhook
      if (this.settings.webhook) {
        const personalWebhook = {
          ...webhook,
          url: this.settings.webhook,
          profileName: currentTask.profile.name,
          checkoutLink: (currentTask.transactionData.method === 'PayMaya') ? currentTask.transactionData.checkoutLink : '',
          checkoutCookie: (currentTask.transactionData.cookie) ? currentTask.transactionData.cookie.value : '',
          proxyList: currentTask.proxy.name,
          orderNumber: currentTask.transactionData.order,
          mode: currentTask.mode
        }
        this.sendWebhook(personalWebhook)
      }

      // send to public webhook
      const publicWebhook = {
        ...webhook,
        url: Config.bot.webhook
      }
      this.sendWebhook(publicWebhook)
    },

    /**
     * Proceed to checkout page
     *
     * @param {*} task
     */
    redirectToCheckout (task) {
      switch (task.transactionData.method) {
        case 'PayMaya':
          ipcRenderer.send('pay-with-paymaya', JSON.stringify({ task: task, settings: this.settings }))
          break
        case '2c2p':
          ipcRenderer.send('pay-with-2c2p', JSON.stringify({ task: task, settings: this.settings }))
          break
      }
    }
  }
}
