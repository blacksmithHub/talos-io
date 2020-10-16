import { mapState, mapActions } from 'vuex'

import StopWatch from 'statman-stopwatch'
import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import transactionApi from '@/api/magento/titan22/transaction'
import Constant from '@/config/constant'
import Config from '@/config/app'

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
  computed: {
    ...mapState('task', { allTasks: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),

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
     * Initialize automation.
     *
     * @param {*} task
     */
    async init (task) {
      if (!this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return {}
      }

      return await this.shopping(task)
        .then((response) => {
          if (!Object.keys(response).length) this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        })
    },

    /**
     * Start shopping sequence.
     *
     * @param {*} task
     */
    async shopping (task) {
      /**
       * Step 1: authenticate
       *
       * get user token
       */
      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'authenticating', 'orange')

      let tokenData = null

      await this.authenticate(task, (response) => { tokenData = response })

      if (!tokenData || !this.isRunning(task.id)) return {}

      /**
       * Step 2: get profile
       *
       * get profile data
       */
      let userData = {}

      await this.getProfile(task, tokenData, (response) => { userData = response })

      if (!Object.keys(userData).length || !this.isRunning(task.id)) return {}

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

      await this.createCart(task, user, (response) => { cartId = response })

      if (!cartId || !this.isRunning(task.id)) return {}

      /**
       * Step 4: get cart
       *
       * get active cart
       */
      let cartData = {}

      await this.getCart(task, user, (response) => { cartData = response })

      if (!Object.keys(cartData).length || !this.isRunning(task.id)) return {}

      /**
       * Step 5: clean cart
       *
       * remove items inside cart
       */
      let cleanCartData = false

      await this.cleanCart(task, cartData, user, (response) => { cleanCartData = response })

      if (!cleanCartData || !this.isRunning(task.id)) return {}

      /**
       * Step 6: add item to cart
       *
       * add item to cart
       */
      let productData = {}

      await this.addItemToCart(task, cartData, user, (response) => { productData = response })

      if (!Object.keys(productData).length || !this.isRunning(task.id)) return {}

      /**
       * Step 7: set shipping info
       *
       * set shipping details
       */
      let shippingData = {}

      await this.setShippingInfo(task, user, productData, (response) => { shippingData = response })

      if (!Object.keys(shippingData).length || !this.isRunning(task.id)) return {}

      /**
       * Step 8: place order
       *
       * place order
       */
      return await this.placeOrder(task, shippingData, user, cartData)
    },

    /**
     * Authentication process.
     *
     * @param {*} task
     * @param {*} callback
     */
    async authenticate (task, callback) {
      let token = null

      const credentials = {
        username: task.email,
        password: task.password
      }

      while (!token && this.isRunning(task.id)) {
        const apiResponse = await authApi.fetchToken(credentials)

        if (!apiResponse) continue

        token = apiResponse
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
      let user = {}

      while (!Object.keys(user).length && this.isRunning(task.id)) {
        const apiResponse = await customerApi.profile(token)

        if (!apiResponse || !apiResponse.addresses.length) continue

        user = apiResponse
      }

      callback(user)
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

      while (!cartId && this.isRunning(task.id)) {
        const apiResponse = await cartApi.create(user.token)

        if (!apiResponse) continue

        cartId = apiResponse
      }

      callback(cartId)
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

      while (!Object.keys(cart).length && this.isRunning(task.id)) {
        const apiResponse = await cartApi.get(user.token)

        if (!apiResponse) continue

        cart = apiResponse
      }

      callback(cart)
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

      while (!success && this.isRunning(task.id)) {
        if (!cart.items.length) {
          success = true
          break
        }

        const promises = []

        Object.keys(cart.items).forEach(async (item) => {
          await promises.push(cartApi.delete(cart.items.[item].item_id, user.token))
        })

        await Promise.all(promises)
          .then((values) => { success = !values.includes(false) })
      }

      callback(success)
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

      while (!Object.keys(response).length && this.isRunning(task.id)) {
        for (var i = 0; i < task.sizes.length; ++i) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${task.sizes[i].label} - trying`, 'orange')

          const order = {
            cartItem: {
              sku: task.sku,
              qty: 1,
              quote_id: cart.id.toString(),
              product_option: {
                extension_attributes: {
                  configurable_item_options: [
                    {
                      option_id: task.sizes[i].attribute_id.toString(),
                      option_value: parseInt(task.sizes[i].value)
                    }
                  ]
                }
              },
              product_type: 'configurable'
            }
          }

          if (!this.isRunning(task.id)) break

          const apiResponse = await cartApi.store(order, user.token)

          if (apiResponse) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${task.sizes[i].label} - carted`, 'orange')
            response = apiResponse
            break
          }
        }

        if (Object.keys(response).length) break
      }

      callback(response)
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

      await this.getEstimateShipping(product, defaultShippingAddress, task, user, (response) => { shippingInfo = response })

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

      while (!Object.keys(shipping).length && this.isRunning(task.id)) {
        if (!this.isRunning(task.id)) break

        const cartApiResponse = await cartApi.setShippingInformation(shippingParams, user.token)

        this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'set shipping info', 'orange')

        if (!cartApiResponse) continue

        shipping = cartApiResponse
        break
      }

      callback(shipping)
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

      if (product.price < 5000) {
        const estimateParams = { addressId: defaultShippingAddress.id }

        let success = false

        while (!success && this.isRunning(task.id)) {
          if (!this.isRunning(task.id)) break

          const apiResponse = await cartApi.estimateShipping(estimateParams, user.token)

          this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'estimate shipping', 'orange')

          if (!apiResponse) continue

          shippingInfo = apiResponse[0]
          success = true
        }
      }

      callback(shippingInfo)
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
    async placeOrder (task, shippingData, user, cartData) {
      const sizeLabel = JSON.parse(shippingData.totals.items[0].options)[0].value

      const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

      const params = {
        payload: {
          amcheckout: {},
          billingAddress: this.setAddresses(defaultBillingAddress, user),
          cartId: cartData.id.toString(),
          paymentMethod: {
            additional_data: null,
            method: shippingData.payment_methods[0].code,
            po_number: null
          }
        },
        token: user.token
      }

      let transactionData = {}
      const vm = this

      const sw = new StopWatch()

      await this.timer(task, sizeLabel, async (response) => {
        if (response) {
          sw.start()

          while (!Object.keys(transactionData).length && vm.isRunning(task.id)) {
            vm.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${sizeLabel} - placing order`, 'orange')

            const apiResponse = await transactionApi.placeOrder(params)

            if (!apiResponse) continue

            transactionData = apiResponse
          }

          sw.stop()
        }
      })

      if (!Object.keys(transactionData).length || !this.isRunning(task.id)) return {}

      this.onSuccess(task, transactionData, shippingData, (sw.read() / 1000.0).toFixed(2))

      return transactionData
    },

    /**
     * Trigger timer, wait to proceed.
     *
     * @param {*} task
     * @param {*} sizeLabel
     * @param {*} callback
     */
    timer (task, sizeLabel, callback) {
      let proceed = false
      const vm = this

      const loop = setInterval(function () {
        if (!vm.isRunning(task.id)) {
          clearInterval(loop)
          callback(proceed)
        }

        if (vm.settings.placeOrder) {
          vm.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${sizeLabel} - waiting to place order`, 'orange')

          const timer = vm.$moment(`${vm.$moment().format('YYYY-MM-DD')} ${vm.settings.placeOrder}`).format('hh:mm:ss a')
          const current = vm.$moment().format('hh:mm:ss a')

          if (timer === current) {
            proceed = true
            clearInterval(loop)
            callback(proceed)
          }
        } else {
          proceed = true
          clearInterval(loop)
          callback(proceed)
        }
      }, 1000)
    },

    /**
     * Trigger on success event.
     *
     * @param {*} task
     * @param {*} transactionData
     * @param {*} shippingData
     * @param {*} time
     */
    onSuccess (task, transactionData, shippingData, time) {
      this.updateTask({
        ...task,
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'copped!',
          class: 'success'
        },
        transactionData: transactionData
      })

      if (this.settings.sound) {
        var audio = new Audio(require('@/assets/success.mp3'))
        audio.play()
      }

      this.$toast.open({
        message: '<strong style="font-family: Arial; text-transform: uppercase">checked out</strong>',
        type: 'success',
        duration: 3000
      })

      if (this.settings.webhook) {
        const webhookDetails = {
          order: shippingData,
          time: time,
          task: task
        }

        this.webhook(webhookDetails)
      }

      if (this.settings.autoPay) this.launchWindow(transactionData, task)
    },

    /**
     * Send webhook.
     *
     * @param {*} data
     */
    webhook (data) {
      const purchased = data.order.totals.items[0]

      const webhook = require('webhook-discord')

      const Hook = new webhook.Webhook(this.settings.webhook)

      const msg = new webhook.MessageBuilder()
        .setAvatar('https://neilpatel.com/wp-content/uploads/2019/08/google.jpg')
        .setFooter('Titan Bot', 'https://neilpatel.com/wp-content/uploads/2019/08/google.jpg')
        .setTime()
        .setName('Titan Bot')
        .setColor('#008000')
        .setTitle('Copped!')
        .setDescription(`
          **Product:** ${purchased.name}\n
          **Size:** ${JSON.parse(purchased.options)[0].value}\n
          **Task:** ${data.task.name}\n
          **Checkout Time:** ${data.time} secs
        `)

      Hook.send(msg)
    },

    /**
     * Launch 2c2p payment window.
     *
     * @param {*} transactionData
     * @param {*} task
     */
    launchWindow (transactionData, task) {
      const electron = require('electron')
      const { BrowserWindow } = electron.remote

      const baseUrl = `${Config.services.titan22.checkout}/RedirectV3/Payment/Accept`

      let win = new BrowserWindow({
        width: 800,
        height: 600
      })

      win.removeMenu()

      const ses = win.webContents.session

      ses.cookies.set({
        url: baseUrl,
        ...transactionData.cookies
      })
        .then(() => {
          win.loadURL(baseUrl)

          if (this.settings.autoPay) {
            let script = ''

            switch (task.bank.id) {
              case Constant.BANK.GCASH.id:
                // TODO: auto fill.
                script = 'document.getElementById(\'btnGCashSubmit\').click()'
                break

              default:
                // TODO: expiry fields
                script = `document.getElementById('credit_card_number').value = '${task.bank.cardNumber}'
                document.getElementById('credit_card_holder_name').value = '${task.bank.cardHolder}'
                document.getElementById('credit_card_expiry_month').value = '02'
                document.getElementById('credit_card_expiry_year').value = '2020'
                document.getElementById('credit_card_cvv').value = '${task.bank.cvv}'
                document.getElementById('credit_card_issuing_bank_name').value = '${task.bank.name}'
                document.getElementById('btnCCSubmit').click()`
                break
            }

            win.webContents.executeJavaScript(script)
          }

          win.on('closed', () => {
            win = null
          })
        })
    }
  }
}
