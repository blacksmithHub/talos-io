import Vue from 'vue'
import Vuex from 'vuex'

import core from './modules/core'
import snackbar from './modules/snackbar'

import settings from './modules/models/settings'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    core,
    snackbar,

    settings
  }
})
