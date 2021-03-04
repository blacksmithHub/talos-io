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
      package: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D')),
      dialog: false,
      dialogComponent: {
        header: '',
        content: ''
      }
    }
  },
  mutations: {
    /**
     * Store dialog.
     *
     * @param {*} state
     * @param {*} dialog
     */
    SET_DIALOG (state, dialog) {
      state.dialog = dialog
    },
    /**
     * Store dialogComponent.
     *
     * @param {*} state
     * @param {*} component
     */
    SET_DIALOG_COMPONENT (state, component) {
      state.dialogComponent = component
    }
  },
  actions: {
    /**
     * set dialog.
     *
     * @param {*} param
     * @param {*} dialog
     */
    setDialog ({ commit }, dialog) {
      commit('SET_DIALOG', dialog)
    },
    /**
     * set dialogComponent.
     *
     * @param {*} param
     * @param {*} component
     */
    setDialogComponent ({ commit }, component) {
      commit('SET_DIALOG_COMPONENT', component)
    }
  }
}
