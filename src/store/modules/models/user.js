export default {
  namespaced: true,
  state () {
    return {
      // items: localStorage.getItem('users')
      //   ? JSON.parse(localStorage.getItem('users'))
      //   : []
      items: [
        {
          id: 1,
          name: 'User 1',
          email: 'qwertyiyan13@gmail.com',
          password: 'Seiburner4923'
        },
        {
          id: 2,
          name: 'User 2',
          email: 'bolrt@gmail.com',
          password: 'Password123'
        },
        {
          id: 3,
          name: 'User 3',
          email: 'yanfour@gmail.com',
          password: 'Password123'
        },
        {
          id: 4,
          name: 'User 3',
          email: 'burnmebitch@gmail.com',
          password: 'Password123'
        }
      ]
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
      if (localStorage.getItem('users')) localStorage.removeItem('users')
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('users', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const users = state.items.slice()

      let lastItemId = users[users.length - 1]

      if (lastItemId) {
        lastItemId = lastItemId.id + 1
      } else {
        lastItemId = 1
      }

      users.push({
        id: lastItemId,
        ...item,
        name: item.name || `User ${lastItemId}`
      })

      commit('SET_ITEMS', users)
      localStorage.setItem('users', JSON.stringify(users))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let users = state.items.slice()

      users = users.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', users)
      localStorage.setItem('users', JSON.stringify(users))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, key) {
      commit('DELETE_ITEM', key)
      localStorage.setItem('users', JSON.stringify(state.items))
    }
  }
}
