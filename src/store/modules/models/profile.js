export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      items: []
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
     * Add item.
     *
     * @param {*} state
     * @param {*} item
     */
    ADD_ITEM (state, item) {
      state.items.push(item)
    },

    /**
     * Update an item.
     *
     * @param {*} state
     * @param {*} params
     */
    UPDATE_ITEM (state, params) {
      state.items[params.key] = params.item
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
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ commit }, item) {
      commit('ADD_ITEM', item)
    },

    /**
     * Trigger update item.
     *
     * @param {*} params
     */
    updateItem ({ commit }, params) {
      commit('UPDATE_ITEM', params)
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ commit }, key) {
      commit('DELETE_ITEM', key)
    }
  }
}
