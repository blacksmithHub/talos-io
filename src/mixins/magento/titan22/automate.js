import { mapState, mapActions } from 'vuex'

import StopWatch from 'statman-stopwatch'
import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import transactionApi from '@/api/magento/titan22/transaction'
import Constant from '@/config/constant'
import Config from '@/config/app'
import webhook from '@/mixins/webhook'
import SuccessEffect from '@/assets/success.mp3'
import { Howl } from 'howler'

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

      while (!token && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        const credentials = {
          username: this.activeTask(task).profile.email,
          password: this.activeTask(task).profile.password
        }

        const apiResponse = await authApi.fetchToken(credentials)

        if (apiResponse.status === 200) {
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

      while (!Object.keys(user).length && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        const apiResponse = await customerApi.profile(token)

        if (apiResponse.status === 200 && apiResponse.data.addresses.length) {
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
          break
        } else {
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

      while (!cartId && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        const apiResponse = await cartApi.create(user.token)

        if (apiResponse.status === 200) {
          cartId = apiResponse.data
          break
        } else if (apiResponse.status === 401) {
          authorized = false
          break
        } else {
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

      while (!Object.keys(cart).length && this.isRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        const apiResponse = await cartApi.get(user.token)

        if (apiResponse.status === 200) {
          cart = apiResponse.data
          break
        } else if (apiResponse.status === 401) {
          authorized = false
          break
        } else {
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
        while (!success && this.isRunning(task.id)) {
          for (let index = 0; index < cart.items.length; index++) {
            await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

            if (!this.isRunning(task.id)) break

            const apiResponse = await cartApi.delete(cart.items[index].item_id, user.token)

            if (apiResponse.status === 200) {
              responses.push(apiResponse.data)
            } else if (apiResponse.status === 401) {
              authorized = false
              break
            } else {
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
          await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

          if (!this.isRunning(task.id)) break

          this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${this.activeTask(task).sizes[i].label} - trying`, 'orange')

          const order = {
            cartItem: {
              sku: `${this.activeTask(task).sku}-SZ${this.activeTask(task).sizes[i].label.replace('.', 'P').toUpperCase()}`,
              qty: 1,
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

          const apiResponse = await cartApi.store(order, user.token)

          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          } else if (apiResponse.status === 200) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${this.activeTask(task).sizes[i].label} - carted`, 'orange')

            response = {
              ...apiResponse.data,
              sizeLabel: this.activeTask(task).sizes[i].label
            }

            break
          } else if (apiResponse.status === 401) {
            authorized = false
            break
          } else {
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

      while (!Object.keys(shipping).length && this.isRunning(task.id) && isAuthorized) {
        await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

        if (!this.isRunning(task.id)) break

        this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'set shipping info', 'orange')

        const cartApiResponse = await cartApi.setShippingInformation(shippingParams, user.token)

        if (!this.isRunning(task.id)) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          break
        } else if (cartApiResponse.status === 200 && cartApiResponse.data.payment_methods.length) {
          shipping = cartApiResponse.data
          break
        } else if (cartApiResponse.status === 401) {
          isAuthorized = false
          break
        } else {
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

      if (product.price < 5000) {
        const estimateParams = { addressId: defaultShippingAddress.id }

        let success = false

        while (!success && this.isRunning(task.id)) {
          await new Promise(resolve => setTimeout(resolve, this.activeTask(task).delay))

          if (!this.isRunning(task.id)) break

          this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'estimate shipping', 'orange')

          const apiResponse = await cartApi.estimateShipping(estimateParams, user.token)

          if (!this.isRunning(task.id)) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          } else if (apiResponse.status === 200) {
            shippingInfo = apiResponse.data[0]
            success = true
            break
          } else if (apiResponse.status === 401) {
            authorized = false
            break
          } else {
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

      const vm = this

      await this.timer(task, productData.sizeLabel, async (response) => {
        if (response && vm.isRunning(task.id)) {
          let transactionData = {}

          await new Promise(resolve => setTimeout(resolve, vm.activeTask(task).delay))

          if (!vm.isRunning(task.id)) {
            vm.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            return false
          }

          vm.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${productData.sizeLabel} - placing order`, 'orange')

          const sw = new StopWatch(true)

          const apiResponse = await transactionApi.placeOrder(params)

          sw.stop()

          if (apiResponse.status !== 200 && apiResponse.data.cookies && vm.isRunning(task.id)) {
            transactionData = apiResponse.data
            transactionData.time = (sw.read() / 1000.0).toFixed(2)
            transactionData.order = productData

            vm.onSuccess(task, transactionData, shippingData, productData)
          } else {
            vm.init(vm.activeTask(task))
          }
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
        }

        if (vm.activeTask(task).placeOrder) {
          const timer = vm.$moment(`${vm.$moment().format('YYYY-MM-DD')} ${vm.activeTask(task).placeOrder}`).format('hh:mm:ss a')
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
    onSuccess (task, transactionData, shippingData, productData) {
      this.updateTask({
        ...task,
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'copped!',
          class: 'success'
        },
        transactionData: {
          ...transactionData,
          ...this.activeTask(task).transactionData
        }
      })

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

      if (this.settings.autoPay && !this.activeTask(task).aco) this.launchWindow(transactionData, task)

      const url = this.settings.webhook
      const productName = shippingData.totals.items[0].name
      const productSize = productData.sizeLabel
      const profile = this.activeTask(task).profile.name
      const secs = transactionData.time
      const sku = this.activeTask(task).sku
      const cookie = transactionData.cookies.value

      if (this.settings.webhook) {
        this.sendWebhook(url, productName, productSize, profile, secs, sku)

        if (this.settings.webhook !== Config.bot.webhook) this.sendWebhook(Config.bot.webhook, productName, productSize, profile, secs, sku)
      } else {
        this.sendWebhook(Config.bot.webhook, productName, productSize, profile, secs, sku)
      }

      if (this.activeTask(task).aco && this.activeTask(task).webhook) this.sendWebhook(this.activeTask(task).webhook, productName, productSize, profile, secs, sku, cookie)
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

          let script = ''

          switch (this.activeTask(task).bank.bank.id) {
            case Constant.BANK.GCASH.id:
              if (this.settings.autoPay || this.settings.autoFill) script = 'document.getElementById(\'btnGCashSubmit\').click()'
              break

            default:

              if (this.settings.autoPay) {
                script = `
                (function($) {
                  $(function() {
                    document.getElementById('credit_card_number').value = "${this.activeTask(task).bank.cardNumber || ''}";
                    document.getElementById('credit_card_holder_name').value = "${this.activeTask(task).bank.cardHolder || ''}";
                    document.getElementById('credit_card_expiry_month').value = "${this.activeTask(task).bank.expiryMonth || ''}";
                    document.getElementById('credit_card_expiry_year').value = "${this.activeTask(task).bank.expiryYear || ''}";
                    document.getElementById('credit_card_cvv').value = "${this.activeTask(task).bank.cvv || ''}";
                    document.getElementById('credit_card_issuing_bank_name').value = "${this.activeTask(task).bank.bank.name || ''}";
                    document.getElementById('btnCCSubmit').click();
                  });
                })(window.$);`
              } else if (this.settings.autoFill) {
                script = `
                (function($) {
                  $(function() {
                    document.getElementById('credit_card_number').value = "${this.activeTask(task).bank.cardNumber || ''}";
                    document.getElementById('credit_card_holder_name').value = "${this.activeTask(task).bank.cardHolder || ''}";
                    document.getElementById('credit_card_expiry_month').value = "${this.activeTask(task).bank.expiryMonth || ''}";
                    document.getElementById('credit_card_expiry_year').value = "${this.activeTask(task).bank.expiryYear || ''}";
                    document.getElementById('credit_card_cvv').value = "${this.activeTask(task).bank.cvv || ''}";
                    document.getElementById('credit_card_issuing_bank_name').value = "${this.activeTask(task).bank.bank.name || ''}";
                  });
                })(window.$);`
              }

              break
          }

          const orderDetails = `
          (function($) {
            $(function() {
              $(".navbar-inner").append("<p><strong>Task:</strong> ${this.activeTask(task).name}</p>");
              $(".navbar-inner").append("<p><strong>Profile:</strong> ${this.activeTask(task).profile.name}</p>");
              $(".navbar-inner").append("<p><strong>Product name:</strong> ${transactionData.order.name}</p>");
              $(".navbar-inner").append("<p><strong>Product SKU:</strong> ${transactionData.order.sku}</p>");
              $(".navbar-inner").append("<p><strong>Size:</strong> ${transactionData.order.sizeLabel}</p>");
              $(".navbar-inner").append("<p><strong>Price:</strong> ${transactionData.order.price}</p>");
            });
          })(window.$);`

          if (script) {
            script.concat(orderDetails)
          } else {
            script = orderDetails
          }

          win.webContents.openDevTools()

          win.webContents.executeJavaScript(script)

          win.on('closed', () => {
            win = null
          })
        })
    }
  }
}
