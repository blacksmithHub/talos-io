export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('settings')
        ? JSON.parse(localStorage.getItem('settings'))
        : {}
    }
  },

  mutations: {
    /**
     * Reset all items.
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = {
        placeOrder: null,
        monitorInterval: 60,
        webhook: null,
        nightMode: true,
        sound: true,
        autoPay: false
      }
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
    reset ({ state, commit }) {
      commit('RESET')
      localStorage.setItem('settings', JSON.stringify(state.items))
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
