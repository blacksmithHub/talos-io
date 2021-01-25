import { mapState, mapActions } from 'vuex'
import { Howl } from 'howler'
import { ipcRenderer } from 'electron'

import axios from 'axios'
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
      if (this.isRunning(id)) {
        const task = this.getCurrentTask(id)

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
      if (this.isRunning(id)) {
        const task = this.getCurrentTask(id)

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
      if (this.isRunning(id)) {
        const task = this.getCurrentTask(id)

        task.logs = `${task.logs || ''};${msg}`

        this.updateTask(task)
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
      let token = null

      if (this.isRunning(task.id)) {
        let currentTask = this.getCurrentTask(task.id)

        token = (!currentTask.transactionData.token)
          ? await this.authenticate(task.id, 'cyan')
          : currentTask.transactionData.token

        if (this.isRunning(task.id)) {
          currentTask = this.getCurrentTask(task.id)

          if (!token) {
            this.verify(currentTask)
            return false
          } else {
            currentTask.transactionData.token = token
            this.updateTask(currentTask)
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
          ? await this.getAccount(task.id)
          : currentTask.transactionData.account

        if (this.isRunning(task.id)) {
          currentTask = this.getCurrentTask(task.id)

          if (!account) {
            this.verify(currentTask)
            return false
          } else {
            currentTask.transactionData.account = account
            this.updateTask(currentTask)
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
          ? await this.initializeCart(task.id, 'cyan')
          : currentTask.transactionData.cart

        if (this.isRunning(task.id)) {
          currentTask = this.getCurrentTask(task.id)

          if (!cart) {
            this.verify(currentTask)
            return false
          } else {
            currentTask.transactionData.cart = cart
            this.updateTask(currentTask)
          }
        }
      }

      this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'ready', 'light-blue')
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
      let token = null

      if (this.isRunning(task.id)) {
        let currentTask = this.getCurrentTask(task.id)

        token = (!currentTask.transactionData.token)
          ? await this.authenticate(task.id)
          : currentTask.transactionData.token

        if (this.isRunning(task.id)) {
          currentTask = this.getCurrentTask(task.id)

          if (!token) {
            this.start(currentTask)
            return false
          } else {
            currentTask.transactionData.token = token
            this.updateTask(currentTask)
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
          ? await this.getAccount(task.id)
          : currentTask.transactionData.account

        if (this.isRunning(task.id)) {
          currentTask = this.getCurrentTask(task.id)

          if (!account) {
            this.start(currentTask)
            return false
          } else {
            currentTask.transactionData.account = account
            this.updateTask(currentTask)
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
          ? await this.initializeCart(task.id)
          : currentTask.transactionData.cart

        if (this.isRunning(task.id)) {
          currentTask = this.getCurrentTask(task.id)

          if (!cart) {
            this.start(currentTask)
            return false
          } else {
            currentTask.transactionData.cart = cart
            this.updateTask(currentTask)
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
        product = await this.addToCart(task.id)

        if (this.isRunning(task.id)) {
          const currentTask = this.getCurrentTask(task.id)

          if (!product) {
            this.start(currentTask)
            return false
          } else {
            currentTask.transactionData.product = product
            this.updateTask(currentTask)
          }
        }
      }

      /**
       * Step 5: set shipping info
       *
       * set shipping details
       */
      let shipping = null

      if (this.isRunning(task.id)) {
        shipping = await this.setShippingInfo(task.id)

        if (this.isRunning(task.id)) {
          const currentTask = this.getCurrentTask(task.id)

          if (!shipping) {
            this.start(currentTask)
            return false
          } else {
            currentTask.transactionData.shipping = shipping
            this.updateTask(currentTask)
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
        order = await this.placeOrder(task.id)

        if (order) {
          this.onSuccess(task.id)
        } else if (this.isRunning(task.id)) {
          this.setCurrentTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'cleaning cart', 'orange')

          let currentTask = this.getCurrentTask(task.id)

          const cart = await this.getCart(task.id)

          if (this.isRunning(task.id)) {
            currentTask = this.getCurrentTask(task.id)

            if (cart) {
              currentTask.transactionData.cart = cart
              this.updateTask(currentTask)
            }

            currentTask = this.getCurrentTask(task.id)
            this.start(currentTask)
          }
        }
      }

      return false
    },

    /**
     * Perform login
     *
     * @param {*} id
     */
    async authenticate (id, attr = 'orange') {
      this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, 'authenticating', attr)

      let data = null

      while (this.isRunning(id) && !data) {
        try {
          let currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          if (!this.isRunning(id)) break

          this.updateCurrentTaskLog(id, 'Logging in...')

          currentTask = this.getCurrentTask(id)

          const cancelTokenSource = axios.CancelToken.source()

          currentTask.transactionData.cancelTokenSource = cancelTokenSource

          this.updateTask(currentTask)

          const params = {
            payload: {
              username: currentTask.profile.email,
              password: currentTask.profile.password
            },
            proxy: currentTask.proxy,
            mode: currentTask.mode
          }

          const response = await authApi.fetchToken(params, cancelTokenSource.token)

          if (!this.isRunning(id)) break

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
     * @param {*} id
     */
    async getAccount (id) {
      let data = null

      while (this.isRunning(id) && !data) {
        try {
          let currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          if (!this.isRunning(id)) break

          this.updateCurrentTaskLog(id, 'Fetching account...')

          currentTask = this.getCurrentTask(id)

          const cancelTokenSource = axios.CancelToken.source()

          currentTask.transactionData.cancelTokenSource = cancelTokenSource

          this.updateTask(currentTask)

          const params = {
            token: currentTask.transactionData.token,
            proxy: currentTask.proxy,
            mode: currentTask.mode
          }

          const response = await customerApi.profile(params, cancelTokenSource.token)

          if (!this.isRunning(id)) break

          if (response.status && response.status === 401) {
            currentTask = this.getCurrentTask(id)

            const token = await this.authenticate(id)

            currentTask = this.getCurrentTask(id)

            currentTask.transactionData.token = token

            this.updateTask(currentTask)
          } else if (response && response.addresses.length) {
            data = response
          }
        } catch (error) {
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
      this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, 'initializing cart', attr)

      const cartId = await this.createCart(id)

      let cart = null

      if (cartId) {
        cart = await this.getCart(id)
      }

      return cart
    },

    /**
     * Perform cart creation
     *
     * @param {*} id
     */
    async createCart (id) {
      let data = null

      while (this.isRunning(id) && !data) {
        try {
          let currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          if (!this.isRunning(id)) break

          this.updateCurrentTaskLog(id, 'Creating cart...')

          currentTask = this.getCurrentTask(id)

          const cancelTokenSource = axios.CancelToken.source()

          currentTask.transactionData.cancelTokenSource = cancelTokenSource

          this.updateTask(currentTask)

          const params = {
            token: currentTask.transactionData.token,
            proxy: currentTask.proxy,
            mode: currentTask.mode
          }

          const response = await cartApi.create(params, cancelTokenSource.token)

          if (!this.isRunning(id)) break

          if (response.status && response.status === 401) {
            currentTask = this.getCurrentTask(id)

            const token = await this.authenticate(id)

            currentTask = this.getCurrentTask(id)

            currentTask.transactionData.token = token

            this.updateTask(currentTask)
          } else if (!response.status && response) {
            data = response
          }
        } catch (error) {
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
    async getCart (id) {
      let data = null

      while (this.isRunning(id) && !data) {
        try {
          let currentTask = this.getCurrentTask(id)

          await new Promise(resolve => setTimeout(resolve, currentTask.delay))

          if (!this.isRunning(id)) break

          this.updateCurrentTaskLog(id, 'Fetching cart...')

          currentTask = this.getCurrentTask(id)

          const cancelTokenSource = axios.CancelToken.source()

          currentTask.transactionData.cancelTokenSource = cancelTokenSource

          this.updateTask(currentTask)

          const params = {
            token: currentTask.transactionData.token,
            proxy: currentTask.proxy,
            mode: currentTask.mode
          }

          const response = await cartApi.get(params, cancelTokenSource.token)

          if (!this.isRunning(id)) break

          if (response.status && response.status === 401) {
            currentTask = this.getCurrentTask(id)

            const token = await this.authenticate(id)

            currentTask = this.getCurrentTask(id)

            currentTask.transactionData.token = token

            this.updateTask(currentTask)
          } else if (!response.status && response) {
            data = response
          }
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

              this.updateCurrentTaskLog(id, `Cleaning cart - item ${index + 1}...`)

              currentTask = this.getCurrentTask(id)

              const cancelTokenSource = axios.CancelToken.source()

              currentTask.transactionData.cancelTokenSource = cancelTokenSource

              this.updateTask(currentTask)

              const params = {
                token: currentTask.transactionData.token,
                id: data.items[index].item_id,
                proxy: currentTask.proxy,
                mode: currentTask.mode
              }

              const response = await cartApi.delete(params, cancelTokenSource.token)

              if (!this.isRunning(id)) break

              if (response.status && response.status === 401) {
                currentTask = this.getCurrentTask(id)

                const token = await this.authenticate(id)

                currentTask = this.getCurrentTask(id)

                currentTask.transactionData.token = token

                this.updateTask(currentTask)
              } else if (!response.status && response) {
                deleted = response
              }
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
     * @param {*} id
     */
    async addToCart (id) {
      let data = null

      while (this.isRunning(id) && !data) {
        try {
          let currentTask = this.getCurrentTask(id)

          for (let index = 0; index < currentTask.sizes.length; index++) {
            try {
              await new Promise(resolve => setTimeout(resolve, currentTask.delay))

              if (!this.isRunning(id)) break

              const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - trying`
              this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
              this.updateCurrentTaskLog(id, msg)

              currentTask = this.getCurrentTask(id)

              const cancelTokenSource = axios.CancelToken.source()

              currentTask.transactionData.cancelTokenSource = cancelTokenSource

              this.updateTask(currentTask)

              const params = {
                token: currentTask.transactionData.token,
                payload: {
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
                },
                proxy: currentTask.proxy,
                mode: currentTask.mode
              }

              const response = await cartApi.store(params, cancelTokenSource.token)

              if (!this.isRunning(id)) break

              if (response.status && response.status === 401) {
                currentTask = this.getCurrentTask(id)

                const token = await this.authenticate(id)

                currentTask = this.getCurrentTask(id)

                currentTask.transactionData.token = token

                this.updateTask(currentTask)
              } else if (!response.status && response) {
                data = response
                data.size = currentTask.sizes[index].label.toUpperCase()

                const msg = `Size: ${currentTask.sizes[index].label.toUpperCase()} - carted`
                this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
                this.updateCurrentTaskLog(id, msg)

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
     * @param {*} id
     */
    async setShippingInfo (id) {
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

            const waitingMsg = `Size: ${currentTask.transactionData.product.size} - estimating shipping`
            this.updateCurrentTaskLog(id, waitingMsg)
            this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')

            currentTask = this.getCurrentTask(id)

            const cancelTokenSource = axios.CancelToken.source()

            currentTask.transactionData.cancelTokenSource = cancelTokenSource

            this.updateTask(currentTask)

            const parameters = {
              token: currentTask.transactionData.token,
              payload: { addressId: defaultShippingAddress.id },
              proxy: currentTask.proxy,
              mode: currentTask.mode
            }

            const response = await cartApi.estimateShipping(parameters, cancelTokenSource.token)

            if (!this.isRunning(id)) break

            if (response.status && response.status === 401) {
              currentTask = this.getCurrentTask(id)

              const token = await this.authenticate(id)

              currentTask = this.getCurrentTask(id)

              currentTask.transactionData.token = token

              this.updateTask(currentTask)
            } else if (!response.status && response) {
              params = response[0]
            }
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
      const waitingMsg = `Size: ${currentTask.transactionData.product.size} - setting shipping details`
      this.updateCurrentTaskLog(id, waitingMsg)
      this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')

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

          const cancelTokenSource = axios.CancelToken.source()

          currentTask.transactionData.cancelTokenSource = cancelTokenSource

          this.updateTask(currentTask)

          const params = {
            token: currentTask.transactionData.token,
            payload: payload,
            proxy: currentTask.proxy,
            mode: currentTask.mode
          }

          const response = await cartApi.setShippingInformation(params, cancelTokenSource.token)

          if (!this.isRunning(id)) break

          if (response.status && response.status === 401) {
            currentTask = this.getCurrentTask(id)

            const token = await this.authenticate(id)

            currentTask = this.getCurrentTask(id)

            currentTask.transactionData.token = token

            this.updateTask(currentTask)
          } else if (!response.status && response) {
            data = response
          }
        } catch (error) {
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

      let currentTask = this.getCurrentTask(id)

      const waitingMsg = `Size: ${currentTask.transactionData.product.size} - waiting to place order`
      this.updateCurrentTaskLog(id, waitingMsg)
      this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')

      currentTask = this.getCurrentTask(id)

      if (currentTask.placeOrder) {
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
                const timer = this.$moment(currentTask.placeOrder, 'HH:mm:ss').format('HH:mm:ss')
                const current = this.$moment().format('HH:mm:ss')

                if (current >= timer) {
                  vm.removeTimer(id)
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
      }

      if (!this.isRunning(id)) return data

      currentTask = this.getCurrentTask(id)

      const placingMsg = `Size: ${currentTask.transactionData.product.size} - placing order`
      this.updateCurrentTaskLog(id, placingMsg)
      this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, placingMsg, 'orange')

      currentTask = this.getCurrentTask(id)

      const defaultBillingAddress = currentTask.transactionData.account.addresses.find((val) => val.default_billing)

      const payload = {
        payload: {
          amcheckout: {},
          billingAddress: this.setAddresses(defaultBillingAddress, currentTask.transactionData.account.email),
          cartId: currentTask.transactionData.cart.id.toString(),
          paymentMethod: {
            additional_data: null,
            method: '',
            po_number: null
          }
        },
        token: currentTask.transactionData.token,
        proxy: currentTask.proxy,
        mode: currentTask.mode
      }

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

          currentTask = this.getCurrentTask(id)

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

          data = await this.paypalCheckout(id, payload)

          break
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

      let currentTask = this.getCurrentTask(id)

      for (let index = 1; index <= tries; index++) {
        if (!this.isRunning(id)) break

        try {
          currentTask = this.getCurrentTask(id)

          if (index > 1) {
            const waitingMsg = `Size: ${currentTask.transactionData.product.size} - trying for restock`

            this.updateCurrentTaskLog(id, waitingMsg)
            this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')
          }

          while (this.isRunning(id) && !data) {
            currentTask = this.getCurrentTask(id)

            await new Promise(resolve => setTimeout(resolve, currentTask.delay))

            currentTask = this.getCurrentTask(id)

            const cancelTokenSource = axios.CancelToken.source()

            currentTask.transactionData.cancelTokenSource = cancelTokenSource

            this.updateTask(currentTask)

            const timer = new StopWatch(true)

            const response = await orderApi.placePaymayaOrder(payload, cancelTokenSource.token)

            timer.stop()

            currentTask = this.getCurrentTask(id)
            const speed = (timer.read() / 1000.0).toFixed(2)

            currentTask.transactionData.timer = speed

            this.updateTask(currentTask)

            if (!this.isRunning(id)) break

            if (response.status && response.status === 401) {
              currentTask = this.getCurrentTask(id)

              const token = await this.authenticate(id)

              currentTask = this.getCurrentTask(id)

              currentTask.transactionData.token = token

              this.updateTask(currentTask)
            }

            if (response.status && response.status !== 429) break

            if (response) data = response
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

        this.updateCurrentTaskLog(id, msg)
        this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
      } else {
        const msg = `Size: ${currentTask.transactionData.product.size} - copped!`

        currentTask.transactionData.product.image = await this.searchProduct(id)
        currentTask.transactionData.checkoutLink = data.request.uri.href
        currentTask.transactionData.method = 'PayMaya'
        currentTask.logs = `${currentTask.logs || ''};${msg}`
        currentTask.status = {
          id: Constant.TASK.STATUS.STOPPED,
          msg: msg,
          class: 'success'
        }

        this.updateTask(currentTask)
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

      let currentTask = this.getCurrentTask(id)

      for (let index = 1; index <= tries; index++) {
        if (!this.isRunning(id)) break

        try {
          currentTask = this.getCurrentTask(id)

          if (index > 1) {
            const waitingMsg = `Size: ${currentTask.transactionData.product.size} - trying for restock`

            this.updateCurrentTaskLog(id, waitingMsg)
            this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')
          }

          while (this.isRunning(id) && !data) {
            currentTask = this.getCurrentTask(id)

            await new Promise(resolve => setTimeout(resolve, currentTask.delay))

            currentTask = this.getCurrentTask(id)

            const cancelTokenSource = axios.CancelToken.source()

            currentTask.transactionData.cancelTokenSource = cancelTokenSource

            this.updateTask(currentTask)

            const timer = new StopWatch(true)

            const response = await orderApi.place2c2pOrder(payload, cancelTokenSource.token)

            timer.stop()

            currentTask = this.getCurrentTask(id)
            const speed = (timer.read() / 1000.0).toFixed(2)

            currentTask.transactionData.timer = speed

            this.updateTask(currentTask)

            if (!this.isRunning(id)) break

            if (response.status && response.status === 401) {
              currentTask = this.getCurrentTask(id)

              const token = await this.authenticate(id)

              currentTask = this.getCurrentTask(id)

              currentTask.transactionData.token = token

              this.updateTask(currentTask)
            }

            if (response.status && response.status !== 429) break

            if (response) data = response
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

        this.updateCurrentTaskLog(id, msg)
        this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
      } else {
        const msg = `Size: ${currentTask.transactionData.product.size} - copped!`

        currentTask.transactionData.product.image = await this.searchProduct(id)
        currentTask.transactionData.cookie = data.cookie
        currentTask.transactionData.method = '2c2p'
        currentTask.logs = `${currentTask.logs || ''};${msg}`
        currentTask.transactionData.order = data.data
        currentTask.status = {
          id: Constant.TASK.STATUS.STOPPED,
          msg: msg,
          class: 'success'
        }

        this.updateTask(currentTask)
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

      let currentTask = this.getCurrentTask(id)

      for (let index = 1; index <= tries; index++) {
        if (!this.isRunning(id)) break

        try {
          currentTask = this.getCurrentTask(id)

          if (index > 1) {
            const waitingMsg = `Size: ${currentTask.transactionData.product.size} - trying for restock`

            this.updateCurrentTaskLog(id, waitingMsg)
            this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, waitingMsg, 'orange')
          }

          while (this.isRunning(id) && !data) {
            currentTask = this.getCurrentTask(id)

            await new Promise(resolve => setTimeout(resolve, currentTask.delay))

            currentTask = this.getCurrentTask(id)

            const cancelTokenSource = axios.CancelToken.source()

            currentTask.transactionData.cancelTokenSource = cancelTokenSource

            this.updateTask(currentTask)

            const timer = new StopWatch(true)

            const response = await cartApi.paymentInformation(payload, cancelTokenSource.token)

            timer.stop()

            currentTask = this.getCurrentTask(id)
            const speed = (timer.read() / 1000.0).toFixed(2)

            currentTask.transactionData.timer = speed

            this.updateTask(currentTask)

            if (!this.isRunning(id)) break

            if (response.status && response.status === 401) {
              currentTask = this.getCurrentTask(id)

              const token = await this.authenticate(id)

              currentTask = this.getCurrentTask(id)

              currentTask.transactionData.token = token

              this.updateTask(currentTask)
            }

            if (response.status && response.status !== 429) break

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

        this.updateCurrentTaskLog(id, msg)
        this.setCurrentTaskStatus(id, Constant.TASK.STATUS.RUNNING, msg, 'orange')
      } else {
        const msg = `Size: ${currentTask.transactionData.product.size} - copped!`

        currentTask.transactionData.product.image = await this.searchProduct(id)
        currentTask.transactionData.method = 'PayPal'
        currentTask.logs = `${currentTask.logs || ''};${msg}`
        currentTask.status = {
          id: Constant.TASK.STATUS.STOPPED,
          msg: msg,
          class: 'success'
        }

        this.updateTask(currentTask)
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
     * @param {*} id
     */
    onSuccess (id) {
      const currentTask = this.getCurrentTask(id)

      delete currentTask.transactionData.cart

      this.updateTask(currentTask)

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
