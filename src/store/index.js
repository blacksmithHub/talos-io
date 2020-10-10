import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'

import task from './modules/models/task'

import attribute from './modules/static/attribute'
import bank from './modules/static/bank'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,

    task,

    attribute,
    bank
  }
})
