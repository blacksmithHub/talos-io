import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'

import task from './modules/task'
import profile from './modules/profile'
import attribute from './modules/attribute'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,

    task,
    profile,
    attribute
  }
})
