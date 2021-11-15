export default {
  namespaced: true,
  state () {
    return {
      items: localStorage.getItem('cloudflare')
        ? JSON.parse(localStorage.getItem('cloudflare'))
        : {}
    }
  },

  mutations: {
    /**
     * Reset all items.
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = {
        queue: [],
        doors: [true]
      }
      localStorage.setItem('cloudflare', JSON.stringify(state.items))
    },

    /**
     * Store all items.
     *
     * @param {*} state
     */
    SET_ITEMS (state, items) {
      state.items = items
      localStorage.setItem('cloudflare', JSON.stringify(state.items))
    },

    /**
     * Store all queue.
     *
     * @param {*} state
     * @param {*} items
     */
    SET_QUEUE (state, items) {
      state.items.queue = items
      localStorage.setItem('cloudflare', JSON.stringify(state.items))
    },

    /**
     * Store all doors.
     *
     * @param {*} state
     * @param {*} item
     */
    SET_DOORS (state, item) {
      state.items.doors = item
      localStorage.setItem('cloudflare', JSON.stringify(state.items))
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

      return true
    },

    /**
     * Trigger add to queue.
     *
     * @param {*} param
     * @param {*} item
     */
    addToQueue ({ state, commit }, item) {
      const queues = state.items.queue.slice()
      queues.push(item)
      commit('SET_QUEUE', queues)
    },

    /**
     * Trigger remove to queue.
     *
     * @param {*} param
     */
    removeToQueue ({ state, commit }, key) {
      const queues = state.items.queue.slice()

      if (key === null) {
        queues.shift()
      } else {
        queues.splice(key, 1)
      }

      commit('SET_QUEUE', queues)
    },

    /**
     * Trigger update to queue.
     *
     * @param {*} param
     * @param {*} item
     */
    updateToQueue ({ state, commit }, item) {
      let queues = state.items.queue.slice()

      queues = queues.map((el) => {
        if (el.id === item.id) el = item

        return el
      })

      commit('SET_QUEUE', queues)
    },

    /**
     * Trigger set all doors.
     *
     * @param {*} param
     * @param {*} item
     */
    setDoors ({ commit }, item) {
      commit('SET_DOORS', item)
    },

    /**
     * Trigger add doors.
     *
     * @param {*} param
     * @param {*} item
     */
    addDoors ({ state, commit }, item) {
      const doors = state.items.doors.slice()
      doors.push(item)
      commit('SET_DOORS', doors)
    },

    /**
     * Trigger remove doors.
     *
     * @param {*} param
     */
    removeDoors ({ state, commit }) {
      const doors = state.items.doors.slice()
      doors.pop()
      commit('SET_DOORS', doors)
    },

    /**
     * Initialize items.
     *
     * @param {*} param
     */
    init ({ state, commit }) {
      const items = state.items

      items.doors = items.doors.map(el => true)

      commit('SET_ITEMS', items)

      return true
    }
  }
}
