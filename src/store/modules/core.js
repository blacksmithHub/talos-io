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
      package: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D')),
      port: localStorage.getItem('core') ? JSON.parse(localStorage.getItem('core')).port : 5000
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
    },

    /**
     * Set the port.
     *
     * @param state
     * @param port
     */
    SET_PORT (state, port) {
      state.port = port
    }
  },
  actions: {
    /**
     * Set the loading state
     *
     * @param {*} param
     * @param {*} loading
     */
    setLoading ({ state, commit }, loading) {
      commit('SET_LOADING', loading)
      localStorage.setItem('core', JSON.stringify(state))
    },

    /**
     * Toggles the navigation drawer.
     *
     * @param state
     * @param data
     */
    toggleDrawer ({ state, commit }, data) {
      commit('TOGGLE_DRAWER', data)
      localStorage.setItem('core', JSON.stringify(state))
    },

    /**
     * Set the port state
     *
     * @param {*} param
     * @param {*} port
     */
    setPort ({ state, commit }, port) {
      commit('SET_PORT', port)
      localStorage.setItem('core', JSON.stringify(state))
    }
  }
}
