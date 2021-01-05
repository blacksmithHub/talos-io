import { mapState, mapActions } from 'vuex'

import authApi from '@/api/magento/titan22/auth'
import customerApi from '@/api/magento/titan22/customer'
import cartApi from '@/api/magento/titan22/cart'
import Constant from '@/config/constant'
import axios from 'axios'

/**
 * ===============================================
 * Verification service
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
     * Get random proxy from pool
     */
    genProxy (task) {
      const proxy = this.getActiveTask(task).proxy.proxies[Math.floor(Math.random() * this.getActiveTask(task).proxy.proxies.length)]

      const ip = {
        host: proxy.host,
        port: proxy.port
      }

      if (proxy.username && proxy.password) {
        ip.username = proxy.username
        ip.password = proxy.password
      }

      return ip
    },

    /**
     * Check if the task is running.
     *
     */
    isTaskRunning (id) {
      const task = this.allTasks.find((data) => data.id === id)

      if (task) return (task.status.id === Constant.TASK.STATUS.RUNNING)

      return false
    },

    /**
     * Update task status.
     *
     * @param {*} id
     * @param {*} status
     * @param {*} msg
     * @param {*} attr
     */
    async updateTaskStatus (id, status, msg, attr) {
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
    getActiveTask (task) {
      const runningTask = this.allTasks.find((data) => data.id === task.id)

      return runningTask || {}
    },

    /**
     * Initialize automation.
     *
     * @param {*} task
     */
    async verify (task) {
      if (this.isTaskRunning(task.id)) {
        /**
         * Step 1: authenticate
         *
         * get user token
         */
        let token = null
        await this.login(task, (response) => { token = response })

        if (!this.isTaskRunning(task.id)) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          return false
        } else if (!token) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'invalid', 'error')
          return false
        }

        /**
         * Step 2: get profile
         *
         * get profile data
         */
        let profile = {}
        await this.profile(task, token, (response) => { profile = response })

        if (!this.isTaskRunning(task.id)) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          return false
        } else if (!Object.keys(profile).length) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'invalid', 'error')
          return false
        }

        /**
         * Step 3: create cart
         *
         * create cart
         */
        const user = {
          profile: profile,
          token: token
        }
        let cartId = null

        await this.makeCart(task, user, (response) => { cartId = response })

        if (!this.isTaskRunning(task.id)) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          return false
        } else if (!cartId) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'ready', 'light-blue')
          return true
        }

        /**
         * Step 4: get cart
         *
         * get active cart
         */
        let cart = {}
        await this.fetchCart(task, user, (response) => { cart = response })

        if (!this.isTaskRunning(task.id)) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          return false
        } else if (!Object.keys(cart).length) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'ready', 'light-blue')
          return true
        }

        /**
         * Step 5: clean cart
         *
         * remove items inside cart
         */
        await this.removeItemsToCart(task, cart, user, () => {})

        this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'ready', 'light-blue')
        return true
      } else {
        this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
        return true
      }
    },

    /**
     * Authentication process.
     *
     * @param {*} task
     * @param {*} callback
     */
    async login (task, callback) {
      let token = null

      const params = {
        payload: {
          username: this.getActiveTask(task).profile.email,
          password: this.getActiveTask(task).profile.password
        }
      }

      if (this.getActiveTask(task).proxy && Object.keys(this.getActiveTask(task).proxy).length && this.getActiveTask(task).proxy.proxies.length) {
        params.proxy = this.genProxy(this.getActiveTask(task))
      }

      await new Promise(resolve => setTimeout(resolve, this.getActiveTask(task).delay))

      if (!this.isTaskRunning(task.id)) {
        this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
      } else {
        try {
          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.getActiveTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const apiResponse = await authApi.fetchToken(params, cancelTokenSource.token)

          if (!this.isTaskRunning(task.id)) {
            this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          } else if (apiResponse.status === 200 && apiResponse.data) {
            token = apiResponse.data

            this.updateTask({
              ...this.getActiveTask(task),
              transactionData: {
                ...this.getActiveTask(task).transactionData,
                token: token
              }
            })
          }
        } catch (error) {
          token = null
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
    async profile (task, token, callback) {
      let user = {}

      await new Promise(resolve => setTimeout(resolve, this.getActiveTask(task).delay))

      if (!this.isTaskRunning(task.id)) {
        this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
      } else {
        try {
          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.getActiveTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const params = {
            token: token
          }

          if (this.getActiveTask(task).proxy && Object.keys(this.getActiveTask(task).proxy).length && this.getActiveTask(task).proxy.proxies.length) {
            params.proxy = this.genProxy(this.getActiveTask(task))
          }

          const apiResponse = await customerApi.profile(params, cancelTokenSource.token)

          if (!this.isTaskRunning(task.id)) {
            this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          } else if (apiResponse.status === 200 && Object.keys(apiResponse.data).length) {
            user = apiResponse.data

            this.updateTask({
              ...this.getActiveTask(task),
              transactionData: {
                ...this.getActiveTask(task).transactionData,
                user: user
              }
            })
          }
        } catch (error) {
          user = {}
        }
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
    async makeCart (task, user, callback) {
      let cartId = null

      if (this.isTaskRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.getActiveTask(task).delay))

        if (!this.isTaskRunning(task.id)) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          callback(cartId)
          return false
        }

        try {
          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.getActiveTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const params = {
            token: user.token
          }

          if (this.getActiveTask(task).proxy && Object.keys(this.getActiveTask(task).proxy).length && this.getActiveTask(task).proxy.proxies.length) {
            params.proxy = this.genProxy(this.getActiveTask(task))
          }

          const apiResponse = await cartApi.create(params, cancelTokenSource.token)

          if (!this.isTaskRunning(task.id)) {
            this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            callback(cartId)
            return false
          } else if (apiResponse.status === 200 && apiResponse.data) {
            cartId = apiResponse.data
            callback(cartId)
            return true
          }
        } catch (error) {
          cartId = null
        }
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
    async fetchCart (task, user, callback) {
      let cart = {}

      if (this.isTaskRunning(task.id)) {
        await new Promise(resolve => setTimeout(resolve, this.getActiveTask(task).delay))

        if (!this.isTaskRunning(task.id)) {
          this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
          callback(cart)
          return false
        }

        try {
          const cancelTokenSource = axios.CancelToken.source()

          this.updateTask({
            ...this.getActiveTask(task),
            cancelTokenSource: cancelTokenSource
          })

          const params = {
            token: user.token
          }

          if (this.getActiveTask(task).proxy && Object.keys(this.getActiveTask(task).proxy).length && this.getActiveTask(task).proxy.proxies.length) {
            params.proxy = this.genProxy(this.getActiveTask(task))
          }

          const apiResponse = await cartApi.get(params, cancelTokenSource.token)

          if (!this.isTaskRunning(task.id)) {
            this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            callback(cart)
            return false
          } else if (apiResponse.status === 200 && Object.keys(apiResponse.data).length) {
            cart = apiResponse.data
            callback(cart)
            return true
          }
        } catch (error) {
          cart = {}
        }
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
    async removeItemsToCart (task, cart, user, callback) {
      if (!cart.items.length) {
        callback()
        return true
      } else {
        for (let index = 0; index < cart.items.length; index++) {
          await new Promise(resolve => setTimeout(resolve, this.getActiveTask(task).delay))

          if (!this.isTaskRunning(task.id)) {
            this.updateTaskStatus(task.id, Constant.TASK.STATUS.STOPPED, 'stopped', 'grey')
            break
          }

          try {
            const cancelTokenSource = axios.CancelToken.source()

            this.updateTask({
              ...this.getActiveTask(task),
              cancelTokenSource: cancelTokenSource
            })

            const params = {
              id: cart.items[index].item_id,
              token: user.token
            }

            if (this.getActiveTask(task).proxy && Object.keys(this.getActiveTask(task).proxy).length && this.getActiveTask(task).proxy.proxies.length) {
              params.proxy = this.genProxy(this.getActiveTask(task))
            }

            await cartApi.delete(params, cancelTokenSource.token)
          } catch (error) {
            continue
          }
        }

        callback()
      }
    }
  }
}
