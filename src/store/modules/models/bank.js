export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('banks')
        ? JSON.parse(localStorage.getItem('banks'))
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
      if (localStorage.getItem('banks')) localStorage.removeItem('banks')
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('banks', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const banks = state.items.slice()

      let lastItemId = banks[banks.length - 1]

      if (lastItemId) {
        lastItemId = lastItemId.id + 1
      } else {
        lastItemId = 1
      }

      banks.push({
        id: lastItemId,
        ...item,
        nickname: item.nickname || `Bank ${lastItemId}`
      })

      commit('SET_ITEMS', banks)
      localStorage.setItem('banks', JSON.stringify(banks))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let banks = state.items.slice()

      banks = banks.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', banks)
      localStorage.setItem('banks', JSON.stringify(banks))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, key) {
      commit('DELETE_ITEM', key)
      localStorage.setItem('banks', JSON.stringify(state.items))
    }
  }
}
