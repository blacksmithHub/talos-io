export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      items: [
        {
          name: 'Task 1',
          email: 'qwertyiyan13@gmail.com',
          password: 'Seiburner4923',
          gcashNumber: 123456789,
          cardNumber: null,
          cardHolderName: null,
          month: null,
          year: null,
          cvv: null,
          bankName: null,
          status: 1
        },
        {
          name: 'Task 2',
          email: 'bolrt@gmail.com',
          password: 'Password123',
          gcashNumber: 123456789,
          cardNumber: null,
          cardHolderName: null,
          month: null,
          year: null,
          cvv: null,
          bankName: null,
          status: 1
        }
      ]
    }
  },

  mutations: {
    /**
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = []
    },

    /**
     *
     * @param {*} state
     * @param {*} items
     */
    SET_ITEMS (state, items) {
      state.items = items
    },

    /**
     *
     * @param {*} state
     * @param {*} item
     */
    ADD_ITEM (state, item) {
      state.items.push(item)
    },

    /**
     *
     * @param {*} state
     * @param {*} params
     */
    UPDATE_ITEM (state, params) {
      state.items[params.key] = params.task
    },

    /**
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
     *
     * @param {*} param
     */
    reset ({ commit }) {
      commit('RESET')
    },

    /**
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
    },

    /**
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ commit }, item) {
      commit('ADD_ITEM', item)
    },

    /**
     *
     * @param {*} param
     */
    updateItem ({ commit }, params) {
      commit('UPDATE_ITEM', params)
    },

    /**
     *
     * @param {*} param
     * @param {*} key
     */
    deleteItem ({ commit }, key) {
      commit('DELETE_ITEM', key)
    }
  }
}
