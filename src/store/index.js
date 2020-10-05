import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'

import task from './modules/models/task'
import profile from './modules/models/profile'
import attribute from './modules/static/attribute'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,

    task,
    profile,
    attribute
  }
})
