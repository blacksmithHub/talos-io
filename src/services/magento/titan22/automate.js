import auth from '@/services/magento/titan22/api/auth'
import customer from '@/services/magento/titan22/api/customer'
import Config from '@/config/constant'

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
  data () {
    return {
      //
    }
  },
  /**
   *
   */
  stopTask (task) {
    task.status = 1
    return task
  },
  /**
   *
   */
  async init (task) {
    const token = await this.login(task)
    let profile = {}

    if (!token) {
      return this.stopTask(task)
    } else {
      profile = await this.getProfile(token)

      if (!profile || !profile.addresses.length) {
        return this.stopTask(task)
      }
    }

    while (task.status === Config.TASK.STATUS.RUNNING) {
      const response = await this.shop(profile, token, task)

      if (!response) {
        this.stopTask(task)
        break
      } else {
        console.log('copped!')
        this.stopTask(task)
        break
      }
    }
  },

  /**
   *
   */
  async login (task) {
    try {
      const params = {
        username: task.email,
        password: task.password
      }

      return await auth.fetchToken(params)
        .then(({ data }) => data)
    } catch (error) {
      return null
    }
  },

  /**
   *
   */
  async getProfile (token) {
    try {
      return await customer.profile(token)
        .then(({ data }) => data)
    } catch (error) {
      return null
    }
  },

  /**
   *
   */
  async shop (profile, token, task) {
    const cart = await this.prepareCart(token)
    const product = await this.searchProduct(task)

    await this.placeOrder(cart, product)

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

  /**
   *
   */
  async prepareCart (token) {
    // create
    // fetch
    // clean
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
