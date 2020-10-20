export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('profiles')
        ? JSON.parse(localStorage.getItem('profiles'))
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
      if (localStorage.getItem('profiles')) localStorage.removeItem('profiles')
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('profiles', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const profiles = state.items.slice()

      let lastItemId = profiles[profiles.length - 1]

      if (lastItemId) {
        lastItemId = lastItemId.id + 1
      } else {
        lastItemId = 1
      }

      profiles.push({
        id: lastItemId,
        ...item,
        name: item.name || `Profile ${lastItemId}`
      })

      commit('SET_ITEMS', profiles)
      localStorage.setItem('profiles', JSON.stringify(profiles))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let profiles = state.items.slice()

      profiles = profiles.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', profiles)
      localStorage.setItem('profiles', JSON.stringify(profiles))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, key) {
      commit('DELETE_ITEM', key)
      localStorage.setItem('profiles', JSON.stringify(state.items))
    }
  }
}
