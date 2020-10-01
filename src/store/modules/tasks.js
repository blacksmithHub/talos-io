export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      tasks: []
    }
  },

  mutations: {
    /**
     *
     * @param {*} state
     */
    RESET (state) {
      state.tasks = []
    },

    /**
     *
     * @param {*} state
     * @param {*} tasks
     */
    SET_TASKS (state, tasks) {
      state.tasks = tasks
    },

    /**
     *
     * @param {*} state
     * @param {*} task
     */
    ADD_TASK (state, task) {
      state.tasks.push(task)
    },

    /**
     *
     * @param {*} state
     * @param {*} key
     * @param {*} task
     */
    UPDATE_TASK (state, key, task) {
      state.tasks[key] = task
    },

    /**
     *
     * @param {*} state
     * @param {*} key
     */
    DELETE_TASK (state, key) {
      state.task.splice(key, 1)
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
     * @param {*} tasks
     */
    setTasks ({ commit }, tasks) {
      commit('SET_TASKS', tasks)
    },

    /**
     *
     * @param {*} param
     * @param {*} task
     */
    addTask ({ commit }, task) {
      commit('ADD_TASK', task)
    },

    /**
     *
     * @param {*} param
     * @param {*} key
     * @param {*} task
     */
    updateTask ({ commit }, key, task) {
      commit('UPDATE_TASK', key, task)
    },

    /**
     *
     * @param {*} param
     * @param {*} key
     */
    deleteTask ({ commit }, key) {
      commit('DELETE_TASK', key)
    }
  }
}
