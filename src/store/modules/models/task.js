import Constant from '@/config/constant'
import fs from 'fs'
import base64 from 'base-64'
import utf8 from 'utf8'

export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('tasks')
        ? JSON.parse(localStorage.getItem('tasks'))
        : []
    }
  },

  mutations: {
    /**
     * Store all items.
     *
     * @param {*} state
     * @param {*} items
     */
    SET_ITEMS (state, items) {
      state.items = items
    }
  },

  actions: {
    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('tasks', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    async addItem ({ state, commit }, item) {
      const tasks = state.items.slice()
      const id = (tasks.length) ? tasks.length + 1 : 1

      const data = {
        id: id,
        ...item,
        loading: false,
        status: {
          id: Constant.STATUS.STOPPED,
          msg: 'idle',
          class: 'grey'
        },
        transactionData: {}
      }

      const opt = {}
      if (data.mode.id !== 1) opt.deviceCategory = 'mobile'

      const UserAgent = require('user-agents')
      let userAgent = new UserAgent(opt)
      userAgent = userAgent.toString()

      if (!data.proxy) {
        const rp = require('request-promise')
        const jar = rp.jar()

        data.proxy = {
          id: null,
          name: 'Localhost',
          configs: [{
            rp: rp,
            jar: jar,
            userAgent: userAgent
          }]
        }
      } else {
        data.proxy.configs = data.proxy.configs.map(el => {
          return {
            ...el,
            userAgent: userAgent
          }
        })
      }

      try {
        fs.unlinkSync(`Task-${data.id}.json`)
      } catch (error) {
        //
      }

      const text = JSON.stringify([])
      const bytes = utf8.encode(text)
      const encoded = base64.encode(bytes)
      fs.writeFileSync(`Task-${data.id}.json`, encoded)

      tasks.push(data)

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let tasks = state.items.slice()

      tasks = tasks.map((val) => {
        if (val.id === params.id) {
          if (val.proxy.id !== params.proxy.id || val.mode.id !== params.mode.id) {
            const opt = {}

            if (params.mode.id !== 1) opt.deviceCategory = 'mobile'

            const UserAgent = require('user-agents')
            let userAgent = new UserAgent(opt)
            userAgent = userAgent.toString()

            if (params.proxy.configs && params.proxy.configs.length) {
              params.proxy.configs = params.proxy.configs.map(el => {
                return {
                  ...el,
                  userAgent: userAgent
                }
              })
            } else {
              const rp = require('request-promise')
              const jar = rp.jar()

              params.proxy.configs = [{
                rp: rp,
                jar: jar,
                userAgent: userAgent
              }]
            }
          }

          val = {
            ...val,
            ...params
          }
        }

        return val
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, key) {
      const tasks = state.items.slice()
      const id = tasks[key].id

      tasks.splice(key, 1)

      try {
        fs.unlinkSync(`Task-${id}.json`)
      } catch (error) {
        //
      }

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    },

    /**
     * Initialize items
     */
    init ({ state, commit }) {
      let tasks = state.items.slice()

      tasks = tasks.map((val) => {
        val.loading = false
        val.transactionData = {}
        val.paid = false
        val.status = {
          id: Constant.STATUS.STOPPED,
          msg: 'idle',
          class: 'grey'
        }

        const UserAgent = require('user-agents')
        const opt = {}

        if (val.mode !== 1) opt.deviceCategory = 'mobile'

        let userAgent = new UserAgent(opt)
        userAgent = userAgent.toString()

        const rp = require('request-promise')
        const jar = rp.jar()

        if (!val.proxy || !val.proxy.id) {
          val.proxy = {
            id: null,
            name: 'Localhost',
            configs: [{
              rp: rp,
              jar: jar,
              userAgent: userAgent
            }]
          }
        } else {
          val.proxy.configs = val.proxy.configs.map(el => {
            return {
              rp: rp,
              jar: jar,
              userAgent: userAgent
            }
          })
        }

        return val
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }
}
