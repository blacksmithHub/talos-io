import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import { Ripple } from 'vuetify/lib/directives'

Vue.use(Vuetify, {
  directives: {
    Ripple
  }
})

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      light: {
        primary: '#d85820',
        secondary: '#c9c7be',
        paypalLogin: '#0077be',
        paypalLogout: '#7d7d7d'
      },
      dark: {
        primary: '#fe6726',
        secondary: '#eceadf',
        paypalLogin: '#0077be',
        paypalLogout: '#7d7d7d'
      }
    }
  }
})
