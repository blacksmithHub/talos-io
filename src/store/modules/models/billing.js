export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('billing')
        ? JSON.parse(localStorage.getItem('billing'))
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
      localStorage.setItem('billing', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const billing = state.items.slice()
      const id = (billing.length) ? billing.length + 1 : 1

      billing.push({
        id: id,
        ...item,
        name: (item.name) ? item.name.trim() : `Billing ${id}`
      })

      commit('SET_ITEMS', billing)
      localStorage.setItem('billing', JSON.stringify(billing))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let billing = state.items.slice()

      billing = billing.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', billing)
      localStorage.setItem('billing', JSON.stringify(billing))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, key) {
      const billing = state.items.slice()

      billing.splice(key, 1)

      commit('SET_ITEMS', billing)
      localStorage.setItem('billing', JSON.stringify(billing))
    }
  }
}
