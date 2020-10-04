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

      this.shop(task, user)

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

      const user = {}

      do {
        try {
          const credentials = {
            username: task.email,
            password: task.password
          }

          const token = await authApi.fetchToken(credentials)

          if (!token) {
            this.stopTask(task.id, Constant.TASK.STATUS.RUNNING, 'unauthenticated', 'error')
          } else {
            user.profile = await customerApi.profile(token)

            if (!user.profile || !user.profile.addresses.length) {
              this.stopTask(task.id, Constant.TASK.STATUS.RUNNING, 'invalid address', 'error')
            } else {
              user.token = token
            }
          }
        } catch (error) {
          continue
        }
      } while (!Object.keys(user).length && this.isRunning(task.id))

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
        await this.prepareOrder(task, cart, user)

        const shipping = await this.prepareShipping(task, user)

        const order = await this.placeOrder(task, shipping, user)

        if (order) break
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
        try {
          await cartApi.create(user.token)

          cart = await cartApi.get(user.token)

          if (!cart.items.length) break

          const promises = []

          Object.keys(cart.items).forEach(async (item) => {
            await promises.push(cartApi.delete(cart.items.[item].item_id, user.token))
          })

          await Promise.all(promises)
        } catch (error) {
          continue
        }
      } while (!Object.keys(cart).length && this.isRunning(task.id))

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

      await this.addProductToCart(attr, task, user, cart)
    },

    /**
     * Add product to cart.
     *
     */
    async addProductToCart (attr, task, user, cart) {
      let success = false
      const promises = []

      do {
        task.sizes.forEach(async (preferredSize) => {
          if (!this.isRunning(task.id)) return false

          task.status.msg = `trying size: ${preferredSize}`

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
                      option_value: parseInt(attr.sizes.find((size) => size.label === preferredSize).value)
                    }
                  ]
                }
              },
              product_type: 'configurable'
            }
          }

          try {
            const response = cartApi.store(order, user.token)

            response.then((val) => {
              if (val) return val

              task.status.msg = `size: ${preferredSize} - out of stock`
            })

            /**
             * Exit after success
             */
            await promises.push(response)
          } catch (error) {
            return true
          }
        })

        await Promise.all(promises).then((values) => {
          const shoppingCart = values.filter((val) => val)

          if (shoppingCart.length) {
            task.status.msg = `size: ${shoppingCart[0].size} - carted`
            success = true
          }
        })
      } while (!success && this.isRunning(task.id))
    },

    /**
     * Prepare for checkout.
     *
     * @param {*} task
     * @param {*} user
     */
    async prepareShipping (task, user) {
      task.status.msg = 'setting shipping information'

      let shipping = {}

      do {
        try {
          const defaultShippingAddress = user.profile.addresses.find((val) => val.default_shipping)
          const defaultBillingAddress = user.profile.addresses.find((val) => val.default_billing)

          const estimateParams = {
            addressId: defaultShippingAddress.id
          }

          /**
       * Todo: skip this if price is above 5k
       */
          const response = await cartApi.estimateShipping(estimateParams, user.token)

          const shippingAddress = {
            region: defaultShippingAddress.region.region,
            region_id: defaultShippingAddress.region_id,
            region_code: defaultShippingAddress.region.region_code,
            country_id: defaultShippingAddress.country_id,
            street: defaultShippingAddress.street,
            postcode: defaultShippingAddress.postcode,
            city: defaultShippingAddress.city,
            firstname: defaultShippingAddress.firstname,
            lastname: defaultShippingAddress.lastname,
            email: user.profile.email,
            telephone: defaultShippingAddress.telephone
          }

          const billingAddress = {
            region: defaultBillingAddress.region.region,
            region_id: defaultBillingAddress.region_id,
            region_code: defaultBillingAddress.region.region_code,
            country_id: defaultBillingAddress.country_id,
            street: defaultBillingAddress.street,
            postcode: defaultBillingAddress.postcode,
            city: defaultBillingAddress.city,
            firstname: defaultBillingAddress.firstname,
            lastname: defaultBillingAddress.lastname,
            email: user.profile.email,
            telephone: defaultBillingAddress.telephone
          }

          const shippingParams = {
            addressInformation: {
              shipping_address: shippingAddress,
              billing_address: billingAddress,
              shipping_carrier_code: response[0].carrier_code, // free shipping if price is above 5k
              shipping_method_code: response[0].method_code // free shipping if price is above 5k
            }
          }

          shipping = await cartApi.setShippingInformation(shippingParams, user.token)
        } catch (error) {
          continue
        }
      } while (!Object.keys(shipping).length && this.isRunning(task.id))
    },

    /**
     * Send payment information.
     *
     * @param {*} task
     * @param {*} order
     * @param {*} user
     */
    async placeOrder (task, shipping, user) {
      task.status.msg = 'placing order'

      let orderNumber = ''

      do {
        const params = {
          paymentMethod: {
            method: shipping.payment_methods[0].code
          }
        }

        try {
          orderNumber = await cartApi.createOrder(params, user.token)
        } catch (error) {
          continue
        }
      } while (!orderNumber && this.isRunning(task.id))
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
