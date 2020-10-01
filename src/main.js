import Vue from 'vue'
import Vuelidate from 'vuelidate'
import VueProgressBar from 'vue-progressbar'
import VueMoment from 'vue-moment'
import moment from 'moment-timezone'

import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify'
import vueProgressBar from './plugins/vue-progress-bar'

Vue.use(VueProgressBar, vueProgressBar)

Vue.use(Vuelidate)

Vue.use(VueMoment, { moment })

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
