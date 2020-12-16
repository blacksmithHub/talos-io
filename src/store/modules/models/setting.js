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
        monitorInterval: 5000,
        webhook: null,
        nightMode: true,
        sound: true,
        autoPay: false,
        autoFill: false,
        manual: true,
        monitorProxy: {},
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
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
