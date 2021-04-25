export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('monitor')
        ? JSON.parse(localStorage.getItem('monitor'))
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
        filter: 'updated_at',
        total: 500
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
      localStorage.setItem('monitor', JSON.stringify(state.items))
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('monitor', JSON.stringify(items))
    }
  }
}
