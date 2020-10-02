import authApi from '@/services/magento/titan22/api/auth'
import customerApi from '@/services/magento/titan22/api/customer'
import cartApi from '@/services/magento/titan22/api/cart'
import Constant from '@/config/constant'

/**
 * ===============================================
 * Auth service
 * ===============================================
 *
 * Provides authentication properties and actions
 *
 * ===============================================
 */

export default {
  /**
   * Initialize automation.
   *
   */
  async init (task) {
    if (task.status === Constant.TASK.STATUS.STOPPED) return this.stopTask(task)

    if (this.validate()) {
      const user = await this.authenticate(task)

      if (task.error) return this.stopTask(task)

      while (task.status === Constant.TASK.STATUS.RUNNING) {
        const cart = await this.prepareCart(user)

        await this.shop(task, cart)

        break

      // if (!response) {
      //   this.stopTask(task)
      //   break
      // } else {
      //   this.stopTask(task, 'copped!')
      //   break
      // }
      }
    }
  },

  /**
   * Terminate task.
   *
   */
  stopTask (task) {
    task.status = Constant.TASK.STATUS.STOPPED
    return task
  },

  /**
   *
   */
  validate () {
    // const attributes = JSON.parse(localStorage.getItem('attributes'))

    // const attr = attributes.find((attr) => attr.sizes.filter((size) => size.label === user.task.size))

    // const size = (attr) ? attr.sizes.find((size) => size.label === user.task.size) : ''
    return true
  },

  /**
   * Perform authorization process.
   *
   */
  async authenticate (task) {
    const credentials = {
      username: task.email,
      password: task.password
    }

    const token = await authApi.fetchToken(credentials)

    const user = {}

    if (!token) {
      task.error = true
      task.msg = 'unauthenticated'
    } else {
      user.profile = await customerApi.profile(token)

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
   * Initialize cart.
   *
   */
  async prepareCart (user) {
    await cartApi.create(user.token)

    const cart = await cartApi.get(user.token)

    if (cart.items.length) {
      cart.items.foreach(async (item) => {
        await cartApi.delete(item.item_id)
      })
    }

    return cart
  },

  /**
   * Perform shop sequence.
   *
   */
  async shop (task, cart) {
    await this.placeOrder(task, cart)

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
  },

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

  /**
   *
   */
  async placeOrder (task, cart) {
    const order = {
      qty: 1,
      quote_id: cart.id,
      sku: task.sku,
      product_type: 'configurable',
      product_option: {
        extension_attributes: {
          configurable_item_options: {
            option_id: ''
          }
        }
      }
    }
  }

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
