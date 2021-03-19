import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'
import dialog from './modules/dialog'

import task from './modules/models/task'
import profile from './modules/models/profile'
import bank from './modules/models/bank'
import proxy from './modules/models/proxy'
import setting from './modules/models/setting'
import paypal from './modules/models/paypal'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,
    dialog,

    task,
    setting,
    profile,
    bank,
    proxy,
    paypal
  }
})
