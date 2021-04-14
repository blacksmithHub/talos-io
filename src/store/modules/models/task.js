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
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const tasks = state.items.slice()
      const id = (tasks.length) ? tasks.length + 1 : 1

      tasks.push({
        id: id,
        ...item,
        loading: false,
        status: {
          id: Constant.STATUS.STOPPED,
          msg: 'idle',
          class: 'grey'
        }
      })

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

      tasks.splice(key, 1)

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
        val.status = {
          id: Constant.STATUS.STOPPED,
          msg: 'idle',
          class: 'grey'
        }

        return val
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }
}
