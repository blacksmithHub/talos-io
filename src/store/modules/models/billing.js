export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('billings')
        ? JSON.parse(localStorage.getItem('billings'))
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
      const billings = state.items.slice()
      const id = (billings.length) ? billings.length + 1 : 1

      billings.push({
        id: id,
        ...item,
        name: (item.name) ? item.name.trim() : `Billing ${id}`
      })

      commit('SET_ITEMS', billings)
      localStorage.setItem('billings', JSON.stringify(billings))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let billings = state.items.slice()

      billings = billings.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', billings)
      localStorage.setItem('billings', JSON.stringify(billings))
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ state, commit }, key) {
      const billings = state.items.slice()

      billings.splice(key, 1)

      commit('SET_ITEMS', billings)
      localStorage.setItem('billings', JSON.stringify(billings))
    }
  }
}
