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
      drawer: false,
      loading: false,
      package: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D'))
    }
  },
  mutations: {
    /**
     * Set the loading.
     *
     * @param state
     * @param loading
     */
    SET_LOADING (state, loading) {
      state.loading = loading
    },

    /**
     * Toggles the navigation drawer.
     *
     * @param state
     * @param data
     */
    TOGGLE_DRAWER (state, data) {
      state.drawer = data
    }
  },
  actions: {
    /**
     * Set the loading state
     *
     * @param {*} param0
     * @param {*} loading
     */
    setLoading ({ commit }, loading) {
      commit('SET_LOADING', loading)
    },

    /**
     * Toggles the navigation drawer.
     *
     * @param state
     * @param data
     */
    toggleDrawer ({ commit }, data) {
      commit('TOGGLE_DRAWER', data)
    }
  }
}
