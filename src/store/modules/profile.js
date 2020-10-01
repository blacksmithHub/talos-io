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
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = []
    },

    /**
     *
     * @param {*} state
     * @param {*} items
     */
    SET_ITEMS (state, items) {
      state.items = items
    },

    /**
     *
     * @param {*} state
     * @param {*} item
     */
    ADD_ITEM (state, item) {
      state.items.push(item)
    },

    /**
     *
     * @param {*} state
     * @param {*} key
     * @param {*} item
     */
    UPDATE_ITEM (state, key, item) {
      state.items[key] = item
    },

    /**
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
     *
     * @param {*} param
     */
    reset ({ commit }) {
      commit('RESET')
    },

    /**
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
    },

    /**
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ commit }, item) {
      commit('ADD_ITEM', item)
    },

    /**
     *
     * @param {*} param
     * @param {*} key
     * @param {*} item
     */
    updateItem ({ commit }, key, item) {
      commit('UPDATE_ITEM', key, item)
    },

    /**
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ commit }, key) {
      commit('DELETE_ITEM', key)
    }
  }
}
