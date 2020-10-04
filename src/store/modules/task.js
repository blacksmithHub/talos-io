export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      items: [
        {
          id: 1,
          name: 'Task 1',
          email: 'qwertyiyan13@gmail.com',
          password: 'Seiburner4923',
          sku: '414571-404',
          sizes: ['17'],
          gcashNumber: 123456789,
          cardNumber: null,
          cardHolderName: null,
          expiry: null,
          cvv: null,
          bankName: null,
          status: {
            id: 1,
            msg: 'stopped',
            class: 'stopped'
          }
        },
        {
          id: 2,
          name: 'Task 2',
          email: 'bolrt@gmail.com',
          password: 'Password123',
          sku: '919712-006',
          sizes: ['8'],
          gcashNumber: 123456789,
          cardNumber: null,
          cardHolderName: null,
          expiry: null,
          cvv: null,
          bankName: null,
          status: {
            id: 1,
            msg: 'stopped',
            class: 'stopped'
          }
        },
        {
          id: 3,
          name: 'Task 3',
          email: 'yanfour@gmail.com',
          password: 'Seiburner4923',
          sku: 'DA0907-002',
          sizes: ['10'],
          gcashNumber: 123456789,
          cardNumber: null,
          cardHolderName: null,
          expiry: null,
          cvv: null,
          bankName: null,
          status: {
            id: 1,
            msg: 'stopped',
            class: 'stopped'
          }
        }
      ]
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
      state.loading = false
    },

    /**
     * Store all items.
     *
     * @param {*} state
     * @param {*} items
     */
    SET_ITEMS (state, items) {
      state.items = items
    },

    /**
     * Delete an item.
     *
     * @param {*} state
     * @param {*} key
     */
    DELETE_ITEM (state, key) {
      state.items.splice(key, 1)
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
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const tasks = state.items.slice()

      tasks.push({
        id: tasks[tasks.length - 1].id + 1,
        ...item,
        status: {
          id: 1,
          msg: 'stopped',
          class: 'stopped'
        }
      })

      commit('SET_ITEMS', tasks)
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      const tasks = state.items.slice()

      tasks.find((val) => val.id === params.id).status = params.status

      commit('SET_ITEMS', tasks)
    },

    /**
     * Trigger delete item.
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ commit }, key) {
      commit('DELETE_ITEM', key)
    }
  }
}
