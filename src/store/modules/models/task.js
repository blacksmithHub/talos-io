export default {
  namespaced: true,
  state () {
    return {
      // items: localStorage.getItem('tasks')
      //   ? JSON.parse(localStorage.getItem('tasks'))
      //   : []
      items: [
        {
          id: 1,
          name: 'Task 1',
          email: 'qwertyiyan13@gmail.com',
          password: 'Seiburner4923',
          sku: 'DB6537-113',
          sizes: [
            {
              attribute_id: 139,
              value: '163',
              label: '10'
            }
          ],
          bank: {
            id: 1,
            name: 'GCash',
            cardNumber: 123456789,
            cardHolder: null,
            expiry: null,
            cvv: null
          },
          status: {
            id: 1,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {}
        },
        {
          id: 2,
          name: 'Task 2',
          email: 'bolrt@gmail.com',
          password: 'Password123',
          sku: '919712-006',
          sizes: [
            {
              attribute_id: 139,
              value: '156',
              label: '6'
            }
          ],
          bank: {
            id: 1,
            name: 'GCash',
            cardNumber: 123456789,
            cardHolder: null,
            expiry: null,
            cvv: null
          },
          status: {
            id: 1,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {}
        },
        {
          id: 3,
          name: 'Task 3',
          email: 'yanfour@gmail.com',
          password: 'Password123',
          sku: '919712-006',
          sizes: [
            {
              attribute_id: 139,
              value: '156',
              label: '6'
            }
          ],
          bank: {
            id: 1,
            name: 'GCash',
            cardNumber: 123456789,
            cardHolder: null,
            expiry: null,
            cvv: null
          },
          status: {
            id: 1,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {}
        },
        {
          id: 4,
          name: 'Task 4',
          email: 'burnmebitch@gmail.com',
          password: 'Password123',
          sku: 'DB6537-113',
          sizes: [
            {
              attribute_id: 139,
              value: '162',
              label: '9'
            }
          ],
          bank: {
            id: 1,
            name: 'GCash',
            cardNumber: 123456789,
            cardHolder: null,
            expiry: null,
            cvv: null
          },
          status: {
            id: 1,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {}
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
      if (localStorage.getItem('tasks')) localStorage.removeItem('tasks')
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('tasks', JSON.stringify(items))
    },

    /**
     * Trigger add item.
     *
     * @param {*} param
     * @param {*} item
     */
    addItem ({ state, commit }, item) {
      const tasks = state.items.slice()

      let lastItemId = tasks[tasks.length - 1]

      if (lastItemId) {
        lastItemId = lastItemId.id + 1
      } else {
        lastItemId = 1
      }

      tasks.push({
        id: lastItemId,
        ...item,
        name: item.name || `Task ${lastItemId}`,
        status: {
          id: 1,
          msg: 'stopped',
          class: 'grey'
        },
        transactionData: {}
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    },

    /**
     * Trigger update item.
     *
     * @param {*} param
     */
    updateItem ({ state, commit }, params) {
      let tasks = state.items.slice()

      tasks = tasks.map((val) => {
        if (val.id === params.id) val = params

        return val
      })

      commit('SET_ITEMS', tasks)
      localStorage.setItem('tasks', JSON.stringify(tasks))
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
