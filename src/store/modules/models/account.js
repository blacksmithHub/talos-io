export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('accounts')
        ? JSON.parse(localStorage.getItem('accounts'))
        : []
    }
  },

  mutations: {
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
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('accounts', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const accounts = state.items.slice()
      const id = (accounts.length) ? accounts.length + 1 : 1

      accounts.push({
        id: id,
        ...item,
        name: (item.name) ? item.name.trim() : `Account ${id}`,
        loading: false,
        paypal: {
          ...item.paypal,
          account: null,
          expires_in: null
        }
      })

      commit('SET_ITEMS', accounts)
      localStorage.setItem('accounts', JSON.stringify(accounts))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let accounts = state.items.slice()

      accounts = accounts.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', accounts)
      localStorage.setItem('accounts', JSON.stringify(accounts))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, item) {
      const accounts = state.items.slice()
      const key = accounts.findIndex((el) => el.id === item.id)

      accounts.splice(key, 1)

      commit('SET_ITEMS', accounts)
      localStorage.setItem('accounts', JSON.stringify(accounts))
    },

    /**
     * Initialize accounts
     */
    init ({ state, commit }) {
      let accounts = state.items.slice()

      accounts = accounts.map((val) => {
        val.loading = false
        return val
      })

      commit('SET_ITEMS', accounts)
      localStorage.setItem('accounts', JSON.stringify(accounts))
    }
  }
}
