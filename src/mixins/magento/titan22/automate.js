import { mapState, mapActions } from 'vuex'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import transactionApi from '@/api/magento/titan22/transaction'
import Constant from '@/config/constant'

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
    ...mapState('task', { allTasks: 'items' })
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
     * Initialize automation.
     *
     * @param {*} task
     */
    async init (task) {
      if (!this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      const user = await this.authenticate(task)

      if (!this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      const response = await this.shop(task, user)

      if (!this.isRunning(task.id)) {
        this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return false
      }

      if (!Object.keys(response).length) return false

      return response
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
     * Perform authorization process.
     *
     * @param {*} task
     */
    async authenticate (task) {
      task.status.msg = 'authenticating'

      let success = false
      const user = {}

      while (!success && this.isRunning(task.id)) {
        const credentials = {
          username: task.email,
          password: task.password
        }

        if (!this.isRunning(task.id)) break

        const token = await authApi.fetchToken(credentials)

        if (!token) {
          this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'unauthenticated', 'error')
          success = false
        } else if (this.isRunning(task.id)) {
          const response = await customerApi.profile(token)

          if (!response || !response.addresses.length) {
            this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'invalid address', 'error')
            success = false
          } else {
            user.profile = response
            user.token = token
            success = true
          }
        } else {
          break
        }
      }

      return user
    },

    /**
     * Perform shop sequence.
     *
     * @param {*} task
     * @param {*} user
     */
    async shop (task, user) {
      const cart = await this.prepareCart(task, user)

      if (!this.isRunning(task.id)) this.setTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')

      let data = {}

      while (!Object.keys(data).length && this.isRunning(task.id)) {
        const product = await this.prepareOrder(task, cart, user)

        if (!this.isRunning(task.id)) break

        const order = await this.prepareShipping(task, user, product)

        if (!this.isRunning(task.id)) break

        const transactionData = await this.setPaymentInformation(task, order, user, cart)

        if (!this.isRunning(task.id)) break

        data = transactionData
      }

      return data
    },

    /**
     * Create a quote.
     *
     * @param {*} task
     * @param {*} user
     */
    async prepareCart (task, user) {
      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, 'initializing cart', 'orange')

      let cart = {}

      while (!Object.keys(cart).length && this.isRunning(task.id)) {
        if (!this.isRunning(task.id)) break

        const cartCreateResponse = await cartApi.create(user.token)

        if (!cartCreateResponse) continue

        cart = await this.cleanCart(task, user)
      }

      return cart
    },

    /**
     * Clean current cart.
     *
     * @param {*} user
     */
    async cleanCart (task, user) {
      let success = false
      let cart = {}

      while (!success && this.isRunning(task.id)) {
        if (!this.isRunning(task.id)) break

        const cartGetResponse = await cartApi.get(user.token)

        if (!cartGetResponse) continue

        cart = cartGetResponse

        if (!cart.items.length) break

        const promises = []

        Object.keys(cart.items).forEach(async (item) => {
          await promises.push(cartApi.delete(cart.items.[item].item_id, user.token))
        })

        await Promise.all(promises)
          .then((values) => {
            if (!values.includes(false)) success = true
          })
      }

      return cart
    },

    /**
     * Prepare order.
     *
     * @param {*} task
     * @param {*} cart
     * @param {*} user
     */
    async prepareOrder (task, cart, user) {
      let response = {}

      while (!Object.keys(response).length && this.isRunning(task.id)) {
        for (var i = 0; i < task.sizes.length; ++i) {
          if (!this.isRunning(task.id)) break

          this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `trying size: ${task.sizes[i].label}`, 'orange')

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
            response = apiResponse
            break
          }
        }

        if (Object.keys(response).length) break
      }

      return response
    },

    /**
     * Prepare for checkout.
     *
     * @param {*} task
     * @param {*} user
     * @param {*} product
     */
    async prepareShipping (task, user, product) {
      let shipping = {}

      while (!Object.keys(shipping).length && this.isRunning(task.id)) {
        const defaultShippingAddress = user.profile.addresses.find((val) => val.default_shipping)
        const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

        let shippingInfo = {
          carrier_code: 'freeshipping',
          method_code: 'freeshipping'
        }

        if (product.price < 5000) {
          const estimateParams = {
            addressId: defaultShippingAddress.id
          }

          if (!this.isRunning(task.id)) break

          const apiResponse = await cartApi.estimateShipping(estimateParams, user.token)

          if (!apiResponse) {
            shippingInfo = apiResponse[0]
            continue
          }
        }

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

        if (!this.isRunning(task.id)) break

        const cartApiResponse = await cartApi.setShippingInformation(shippingParams, user.token)

        if (cartApiResponse) {
          shipping = cartApiResponse
          break
        }
      }

      return shipping
    },

    /**
     * Return addresses.
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
     * Send payment information.
     *
     * @param {*} task
     * @param {*} order
     * @param {*} user
     * @param {*} cart
     */
    async setPaymentInformation (task, order, user, cart) {
      const sizeLabel = JSON.parse(order.totals.items[0].options)[0].value
      this.setTaskStatus(task.id, Constant.TASK.STATUS.RUNNING, `size: ${sizeLabel} - placing order`, 'orange')

      let transactionData = {}

      const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

      const params = {
        payload: {
          amcheckout: {},
          billingAddress: this.setAddresses(defaultBillingAddress, user),
          cartId: cart.id.toString(),
          paymentMethod: {
            additional_data: null,
            method: order.payment_methods[0].code,
            po_number: null
          }
        },
        token: user.token
      }

      while (!Object.keys(transactionData).length && this.isRunning(task.id)) {
        const apiResponse = await transactionApi.placeOrder(params)

        if (apiResponse) {
          transactionData = apiResponse
          transactionData.order = order
          break
        }
      }

      return transactionData
    }
  }
}

// /**
//  * Search product by sku.
//  *
//  */
// async searchProduct (task) {
//   const params = {
//     searchCriteria: {
//       pageSize: 50,
//       sortOrders: [
//         {
//           field: 'updated_at',
//           direction: 'DESC'
//         }
//       ],
//       filterGroups: [
//         {
//           filters: [
//             {
//               field: 'sku',
//               value: task.sku
//             }
//           ]
//         }
//       ]
//     }
//   }

//   return await productApi.search(params, App.services.titan22.token)
// }
