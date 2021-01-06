import Vue from 'vue'
import Vuetify from 'vuetify/lib'
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
        // primary: '#d85820',
        // secondary: '#c9c7be'
      },
      dark: {
        // primary: '#fe6726',
        // secondary: '#eceadf'
      }
    }
  }
})
