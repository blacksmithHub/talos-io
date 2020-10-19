<template>
  <v-app>
    <SystemBar />
    <router-view />
    <vue-progress-bar />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import SystemBar from '@/components/App/SystemBar'
import productApi from '@/api/magento/titan22/product'
import App from '@/config/app'

export default {
  components: { SystemBar },
  computed: {
    ...mapState('setting', { settings: 'items' }),
    ...mapState('task', { tasks: 'items' })
  },
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      if (!vm.attributes.length) await vm.prepareAttributes()

      if (vm.tasks.length) await vm.prepareTasks()
    })
  },
  mounted () {
    //  [App.vue specific] When App.vue is finish loading finish the progress bar
    this.$Progress.finish()
  },
  created () {
    //  [App.vue specific] When App.vue is first loaded start the progress bar
    this.$Progress.start()
    //  hook the progress bar to start before we move router-view
    this.$router.beforeEach((to, from, next) => {
      //  start the progress bar
      this.$Progress.start()
      //  continue to next page
      next()
    })
    //  hook the progress bar to finish after we've finished moving router-view
    this.$router.afterEach(() => this.$Progress.finish())

    if (!Object.keys(this.settings).length) this.resetSettings()

    this.setTheme()
  },
  methods: {
    ...mapActions('setting', { resetSettings: 'reset' }),

    /**
     * Set app theme.
     *
     */
    setTheme () {
      this.$vuetify.theme.dark = this.settings.nightMode
    },

    /**
     * Prepare all tasks.
     *
     */
    prepareTasks () {
      this.tasks.forEach(element => {
        this.updateTask({
          ...element,
          status: {
            id: 1,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {}
        })
      })
    },

    /**
     * Prepare attributes.
     *
     */
    async prepareAttributes () {
      this.reset()

      const token = App.services.titan22.token

      const footwears = await this.fetchAttributes('m_footwear_size', token)

      const apparels = await this.fetchAttributes('m_apparel_size', token)

      const attributes = [footwears, apparels]

      this.setAttributes(attributes)
    },

    /**
     * Fetch attributes.
     *
     */
    async fetchAttributes (value, token) {
      const attribute = await productApi.attribute({
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: 'attribute_code',
                  value: value
                }
              ]
            }
          ]
        }
      }, token)

      if (!attribute) return {}

      const sizes = attribute.items[0].options.filter((data) => data.value).map((item) => {
        item.label = item.label.toLowerCase()

        return item
      })

      const response = {
        attribute_id: attribute.items[0].attribute_id,
        sizes: sizes
      }

      return response
    }
  }
}
</script>

<style>
html {
  overflow: auto !important
}
.titleBar {
  -webkit-user-select: none !important;
  -webkit-app-region: drag !important;
}

/* Let's get this party started */
::-webkit-scrollbar {
  width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
  -webkit-border-radius: 10px;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 10px;
  border-radius: 10px;
  background: grey;
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); */
}
::-webkit-scrollbar-thumb:window-inactive {
  background: grey;
}
</style>
