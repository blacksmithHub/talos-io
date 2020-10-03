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
  methods: {
    /**
     * Initialize automation.
     *
     * @param {*} task
     */
    async init (task) {
      if (task.status === Constant.TASK.STATUS.STOPPED) return this.stopTask(task)

      if (this.validate(task)) {
        const user = await this.authenticate(task)

        if (task.error) return this.stopTask(task)

        this.shop(task, user)
      } else {
        task.error = true
        task.msg = 'invalid attributes'

        return this.stopTask(task)
      }
    },

    /**
     * Terminate task.
     *
     * @param {*} task
     */
    stopTask (task) {
      task.status = Constant.TASK.STATUS.STOPPED

      console.log('stopped')

      return task
    },

    /**
     * Validate task.
     *
     * @param {*} task
     */
    validate (task) {
      const attributes = JSON.parse(localStorage.getItem('attributes'))

      const attr = attributes.find((attr) => attr.sizes.find((size) => task.sizes.includes(size.label)))

      console.log('validate')

      return attr
    },

    /**
     * Perform authorization process.
     *
     * @param {*} task
     */
    async authenticate (task) {
      const credentials = {
        username: task.email,
        password: task.password
      }

      const token = await authApi.fetchToken(credentials)

      console.log('login')

      const user = {}

      if (!token) {
        task.error = true
        task.msg = 'unauthenticated'
      } else {
        user.profile = await customerApi.profile(token)

        console.log('get profile')

        if (!user.profile || !user.profile.addresses.length) {
          task.error = true
          task.msg = 'invalid address'
        } else {
          user.token = token
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
      const cart = await this.prepareCart(user)

      while (task.status === Constant.TASK.STATUS.RUNNING) {
        await this.cleanCart(cart, user)
        await this.placeOrder(task, cart, user)

        console.log('done')

        break
      }
    },

    /**
     * Initialize cart.
     *
     * @param {*} user
     */
    async prepareCart (user) {
      await cartApi.create(user.token)

      console.log('create cart')

      const cart = await cartApi.get(user.token)

      console.log('get cart')

      return cart
    },

    /**
     * Delete remaining in cart products.
     *
     * @param {*} cart
     * @param {*} user
     */
    async cleanCart (cart, user) {
      if (!cart.items.length) return true

      const promises = []

      Object.keys(cart.items).forEach(async (item) => {
        await promises.push(cartApi.delete(cart.items.[item].item_id, user.token))
      })

      await Promise.all(promises).then((values) => console.log(values))

      console.log('clean cart')
    },

    /**
     * Place product inside cart
     *
     * @param {*} task
     * @param {*} cart
     * @param {*} user
     */
    async placeOrder (task, cart, user) {
      const attributes = JSON.parse(localStorage.getItem('attributes'))

      const attr = attributes.find((attr) => attr.sizes.find((size) => task.sizes.includes(size.label)))

      await this.loop(attr, task, user, cart)

      console.log('purchased')
    },

    /**
     *
     */
    async loop (attr, task, user, cart) {
      let success = false
      const promises = []
      let done = {}

      do {
        task.sizes.forEach(async (preferredSize) => {
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

          /**
         * Todo: break loop after success
         */
          await promises.push(cartApi.store(order, user.token))
        })

        await Promise.all(promises).then((values) => {
          if (values.filter((val) => val).length) success = true

          done = values.filter((val) => val)[0]
        })
      } while (!success)

      console.log(done, task)
    }
  }

  // const sequence = [
  //   this.prepareCart(token),
  //   this.placeOrder()
  // ]

  // return Promise.all(sequence)
  //   .then(values => {
  //     console.log(values)
  //     return values
  //   })
  //   .catch(() => null)

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
  // },

  // async one () {
  //   return new Promise((resolve, reject) => {
  //     console.log(1)
  //     resolve('one')
  //   })
  // },
  // async two () {
  //   return new Promise((resolve, reject) => {
  //     console.log(2)
  //     resolve('two')
  //   })
  // },
  // async three () {
  //   return new Promise((resolve, reject) => {
  //     console.log(3)
  //     // reject(new Error('reject'))
  //     resolve('three')
  //   })
  // }
}
