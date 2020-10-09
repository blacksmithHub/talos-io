import Vue from 'vue'
import Router from 'vue-router'

import App from './app'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    ...App.routes
  ]
})
