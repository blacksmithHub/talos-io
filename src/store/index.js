import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'
import snackbar from './modules/snackbar'
import dialog from './modules/dialog'

import settings from './modules/models/settings'
import proxy from './modules/models/proxy'
import account from './modules/models/account'
import billing from './modules/models/billing'
import task from './modules/models/task'
import cloudflare from './modules/models/cloudflare'
import monitor from './modules/models/monitor'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,
    snackbar,
    dialog,

    settings,
    proxy,
    account,
    billing,
    task,
    cloudflare,
    monitor
  }
})
