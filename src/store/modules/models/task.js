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
    DELETE_ITEM (state, key) {
      state.items.splice(key, 1)
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
        name: item.name || `Task ${lastItemId}`,
        status: {
          id: 1,
          msg: 'stopped',
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
      let tasks = state.items.slice()

      tasks = tasks.map((val) => {
        if (val.id === params.id) val = params

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
      commit('DELETE_ITEM', key)
      localStorage.setItem('tasks', JSON.stringify(state.items))
    }
  }
}
