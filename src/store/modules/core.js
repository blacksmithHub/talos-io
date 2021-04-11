/**
 * =====================================================
 * Core store
 * =====================================================
 *
 * Handles core states and behavior of the application.
 *
 * =====================================================
 */

export default {
  namespaced: true,
  state () {
    return {
      about: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D')),
      tab: null
    }
  },
  mutations: {
    /**
     * Set current tab.
     *
     * @param {*} state
     * @param {*} tab
     */
    SET_TAB (state, tab) {
      state.tab = tab
    }
  },
  actions: {
    /**
     * Set current tab.
     *
     * @param {*} param
     */
    setCurrentTab ({ commit }, param) {
      commit('SET_TAB', param)
    }
  }
}
