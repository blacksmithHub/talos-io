import Vue from 'vue'
import Router from 'vue-router'

import App from './app'
// import PageNotFound from '@/pages/PageNotFound'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    ...App.routes
    // {
    //   path: '*',
    //   name: 'PageNotFound',
    //   component: PageNotFound
    // }
  ]
})
