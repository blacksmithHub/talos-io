import Vue from 'vue'

import './plugins/vuelidate'
import './plugins/vue-moment'
import './plugins/vue-toast-notification'
import './plugins/vue-json-csv'
import './plugins/vue-clipboard2'
import './plugins/vue-progress-bar'
import './plugins/vue-fontawesome'

import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
