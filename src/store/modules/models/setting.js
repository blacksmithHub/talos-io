export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      items: localStorage.getItem('settings')
        ? JSON.parse(localStorage.getItem('settings'))
        : {
          placeOrder: null,
          monitorInterval: null,
          webhook: null,
          nightMode: false,
          sound: false,
          autoPay: false
        }
    }
  },

  mutations: {
    /**
     * Reset all items.
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = {}
      state.loading = false
    },

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
     * Trigger reset.
     *
     * @param {*} param
     */
    reset ({ commit }) {
      commit('RESET')
      if (localStorage.getItem('settings')) localStorage.removeItem('settings')
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('settings', JSON.stringify(items))
    }
  }
}
