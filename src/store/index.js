import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'

import task from './modules/models/task'
import profile from './modules/models/profile'
import bank from './modules/models/bank'
import setting from './modules/models/setting'

import attribute from './modules/static/attribute'
import staticBank from './modules/static/bank'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,

    task,
    setting,
    profile,
    bank,

    attribute,
    staticBank
  }
})
