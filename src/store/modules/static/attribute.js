export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      items: localStorage.getItem('attributes')
        ? JSON.parse(localStorage.getItem('attributes'))
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
      if (localStorage.getItem('attributes')) localStorage.removeItem('attributes')
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
    },

    /**
       * Trigger store items.
       *
       * @param {*} param
       * @param {*} items
       */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('attributes', JSON.stringify(items))
    }
  }
}
