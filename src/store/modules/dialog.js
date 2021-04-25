/**
 * =======================================
 * Dialog Store
 * =======================================
 *
 * Handles the dialogs of the application.
 *
 * =======================================
 */
export default {
  namespaced: true,
  strict: process.env.APP_ENV === 'development',
  state () {
    return {
      dialog: false,
      title: '',
      body: '',
      action: null,
      cancel: null,
      alert: false,
      cancelLabel: 'cancel',
      actionLabel: 'ok'
    }
  },
  mutations: {
    /**
     * Shows the dialog.
     *
     * @param state
     * @param param1
     */
    OPEN_DIALOG (state, { title, body, action, cancel, alert, cancelLabel, actionLabel }) {
      state.title = title
      state.body = body
      state.action = action
      state.cancel = cancel
      state.dialog = true
      state.alert = alert || false
      state.cancelLabel = cancelLabel || 'cancel'
      state.actionLabel = actionLabel || 'ok'
    },

    /**
     * Hides the dialog in view.
     *
     * @param state
     */
    CLOSE_DIALOG (state) {
      state.title = ''
      state.body = ''
      state.alert = false
      state.dialog = false
    }
  },
  actions: {
    /**
     * Shows the alert dialog.
     *
     * @param {*} param
     * @param config
     */
    openDialog ({ commit }, config) {
      commit('OPEN_DIALOG', config)
    },

    /**
     * Close the dialog in view.
     *
     * @param {*} param
     */
    closeDialog ({ commit }) {
      commit('CLOSE_DIALOG')
    }
  }
}
