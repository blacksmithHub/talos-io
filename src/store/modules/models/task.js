import fs from 'fs'
import base64 from 'base-64'
import utf8 from 'utf8'

import Constant from '@/config/constant'

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

      return true
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    async addItem ({ state, commit }, item) {
      const tasks = state.items.slice()

      const data = {
        ...item,
        id: (tasks.length) ? tasks.length + 1 : 1,
        transactionData: {},
        loading: false,
        status: {
          id: Constant.STATUS.STOPPED,
          msg: 'idle',
          class: 'grey'
        }
      }

      data.proxy.configs = data.proxy.configs.map(el => {
        return {
          ...el,
          retry: 1
        }
      })

      try {
        fs.unlinkSync(`Task-${data.id}.json`)
      } catch (error) {
        console.log(error)
      }

      const text = JSON.stringify([])
      const bytes = utf8.encode(text)
      const encoded = base64.encode(bytes)
      fs.writeFileSync(`Task-${data.id}.json`, encoded)

      tasks.push(data)

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))

      return data
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let tasks = state.items.slice()
      let updatedTask = {}

      tasks = tasks.map((val) => {
        if (val.id === params.id) {
          val = {
            ...val,
            ...params
          }

          updatedTask = val
        }

        return val
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))

      return updatedTask
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, item) {
      const tasks = state.items.slice()
      const key = tasks.findIndex((el) => el.id === item.id)

      tasks.splice(key, 1)

      try {
        fs.unlinkSync(`Task-${item.id}.json`)
      } catch (error) {
        console.log(error)
      }

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))

      return true
    },

    /**
     * Initialize items
     */
    init ({ state, commit }) {
      let tasks = state.items.slice()

      tasks = tasks.map((val) => {
        try {
          fs.readFileSync(`Task-${val.id}.json`)
        } catch (error) {
          const text = JSON.stringify([])
          const bytes = utf8.encode(text)
          const encoded = base64.encode(bytes)
          fs.writeFileSync(`Task-${val.id}.json`, encoded)
        }

        val.loading = false
        val.transactionData = {}
        val.paid = false
        val.status = {
          id: Constant.STATUS.STOPPED,
          msg: 'idle',
          class: 'grey'
        }

        const UserAgent = require('user-agents')
        const opt = { deviceCategory: 'desktop' }

        if (val.mode !== 1) opt.deviceCategory = 'mobile'

        let userAgent = new UserAgent(opt)
        userAgent = userAgent.toString()

        val.proxy.configs = val.proxy.configs.map(el => {
          const rp = require('request-promise')
          const jar = rp.jar()

          return {
            rp: rp,
            jar: jar,
            userAgent: userAgent,
            proxy: el.proxy,
            retry: 1
          }
        })

        return val
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))

      return true
    }
  }
}
