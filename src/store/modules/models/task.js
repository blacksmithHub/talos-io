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
     * Reset all items.
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = []
    },

    /**
     * Store all items.
     *
     * @param {*} state
     * @param {*} items
     */
    SET_ITEMS (state, items) {
      state.items = items
    },

    /**
     * Delete an item.
     *
     * @param {*} state
     * @param {*} key
     */
    DELETE_ITEM (state, id) {
      const index = state.items.indexOf(state.items.find((el) => el.id === id))
      state.items.splice(index, 1)
    }
  },

  actions: {
    /**
     * Trigger reset.
     *
     * @param {*} param
     */
    reset ({ commit }) {
      commit('RESET')
      if (localStorage.getItem('tasks')) localStorage.removeItem('tasks')
    },

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

      let lastItemId = tasks[tasks.length - 1]

      if (lastItemId) {
        lastItemId = lastItemId.id + 1
      } else {
        lastItemId = 1
      }

      tasks.push({
        id: lastItemId,
        ...item,
        status: {
          id: 1,
          msg: 'idle',
          class: 'grey'
        },
        transactionData: {}
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
      const tasks = state.items.slice()

      const task = tasks.find((val) => val.id === params.id)

      if (task) {
        const index = tasks.indexOf(task)

        tasks[index] = params
      }

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
      commit('DELETE_ITEM', key)
      localStorage.setItem('tasks', JSON.stringify(state.items))
    },

    /**
     * Initialize items.
     *
     * @param {*} param
     */
    initializeItems ({ state, commit }) {
      let tasks = state.items.slice()

      tasks = tasks.map(element => {
        element.status = {
          id: 1,
          msg: 'idle',
          class: 'grey'
        }

        element.transactionData = {}
        element.paid = false
        element.logs = ''

        return element
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }
}
