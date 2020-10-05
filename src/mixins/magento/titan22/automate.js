import { mapState, mapActions } from 'vuex'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
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
      const status = this.allTasks.find((data) => data.id === id).status.id

      return (status === Constant.TASK.STATUS.RUNNING)
    },

    /**
     * Initialize automation.
     *
     * @param {*} task
     */
    async init (task) {
      if (task.status.id === Constant.TASK.STATUS.STOPPED) return this.stopTask(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'stopped')

      if (!this.validate(task)) return this.stopTask(task.id, Constant.TASK.STATUS.ERROR, 'invalid attributes', 'error')

      const user = await this.authenticate(task)

      if (!this.isRunning(task.id)) return this.stopTask(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'stopped')

      await this.shop(task, user)

      return this.stopTask(task.id, Constant.TASK.STATUS.STOPPED, 'copped!', 'stopped')
    },

    /**
     * Terminate task.
     *
     * @param {*} id
     * @param {*} status
     * @param {*} msg
     * @param {*} attr
     */
    async stopTask (id, status, msg, attr) {
      await this.updateTask({
        id: id,
        status: {
          id: status,
          msg: msg,
          class: attr
        }
      })
    },

    /**
     * Validate task.
     *
     * @param {*} task
     */
    async validate (task) {
      const attributes = JSON.parse(localStorage.getItem('attributes'))

      const attr = await attributes.find((attr) => attr.sizes.find((size) => task.sizes.includes(size.label)))

      return attr
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

      do {
        const credentials = {
          username: task.email,
          password: task.password
        }

        const token = await authApi.fetchToken(credentials)

        if (!token) {
          this.stopTask(task.id, Constant.TASK.STATUS.RUNNING, 'unauthenticated', 'error')
          success = false
        } else {
          const response = await customerApi.profile(token)

          if (!response || !response.addresses.length) {
            this.stopTask(task.id, Constant.TASK.STATUS.RUNNING, 'invalid address', 'error')
            success = false
          } else {
            user.profile = response
            user.token = token
            success = true
          }
        }
      } while (!success && this.isRunning(task.id))

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

      while (this.isRunning(task.id)) {
        const product = await this.prepareOrder(task, cart, user)

        const order = await this.prepareShipping(task, user, product)

        await this.placeOrder(task, order, user, cart)

        // await this.cleanCart(task, user)

        break
      }
    },

    /**
     * Create a quote.
     *
     * @param {*} task
     * @param {*} user
     */
    async prepareCart (task, user) {
      task.status.msg = 'initializing cart'

      let cart = {}

      do {
        const cartCreateResponse = await cartApi.create(user.token)

        if (!cartCreateResponse) continue

        cart = await this.cleanCart(task, user)
      } while (!Object.keys(cart).length && this.isRunning(task.id))

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

      do {
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
      } while (!success && this.isRunning(task.id))

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
      const attributes = JSON.parse(localStorage.getItem('attributes'))

      const attr = attributes.find((attr) => attr.sizes.find((size) => task.sizes.includes(size.label)))

      return await this.addProductToCart(attr, task, user, cart)
    },

    /**
     * Add product to cart.
     *
     * @param {*} attr
     * @param {*} task
     * @param {*} user
     * @param {*} cart
     */
    async addProductToCart (attr, task, user, cart) {
      let response = {}

      while (!Object.keys(response).length && this.isRunning(task.id)) {
        for (var i = 0; i < task.sizes.length; ++i) {
          if (!this.isRunning(task.id)) break

          task.status.msg = `trying size: ${task.sizes[i]}`

          const order = {
            cartItem: {
              sku: task.sku,
              qty: 1,
              quote_id: cart.id.toString(),
              product_option: {
                extension_attributes: {
                  configurable_item_options: [
                    {
                      option_id: attr.attribute_id.toString(),
                      option_value: parseInt(attr.sizes.find((size) => size.label === task.sizes[i]).value)
                    }
                  ]
                }
              },
              product_type: 'configurable'
            }
          }

          const apiResponse = await cartApi.store(order, user.token)

          if (apiResponse) {
            response = apiResponse
            break
          }

          task.status.msg = `size: ${task.sizes[i]} - out of stock`
        }
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
      task.status.msg = 'setting shipping information'

      let shipping = {}

      do {
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

        shipping = await cartApi.setShippingInformation(shippingParams, user.token)

        if (!shipping) continue
      } while (!Object.keys(shipping).length && this.isRunning(task.id))

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
    async placeOrder (task, order, user, cart) {
      task.status.msg = 'placing order'

      let orderNumber = null

      const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

      const params = {
        amcheckout: {},
        billingAddress: this.setAddresses(defaultBillingAddress, user),
        cartId: cart.id.toString(),
        paymentMethod: {
          additional_data: null,
          method: order.payment_methods[0].code,
          po_number: null
        }
      }

      do {
        const apiResponse = await cartApi.createOrder(params, user.token)

        if (apiResponse) {
          orderNumber = apiResponse
          break
        }
      } while (!orderNumber && this.isRunning(task.id))

      return orderNumber
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
}
