import Vue from 'vue'
import Vuelidate from 'vuelidate'
import VueProgressBar from 'vue-progressbar'
import VueMoment from 'vue-moment'
import moment from 'moment-timezone'
import VueCookies from 'vue-cookies'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify'
import vueProgressBar from './plugins/vue-progress-bar'

Vue.use(VueProgressBar, vueProgressBar)

Vue.use(VueToast)

Vue.use(VueCookies)

Vue.use(Vuelidate)

Vue.use(VueMoment, { moment })

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
