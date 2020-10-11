<template>
  <v-app>
    <SideNav />
    <v-main>
      <Tasks />
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import Tasks from '@/components/Tasks'
import productApi from '@/api/magento/titan22/product'
import App from '@/config/app'
import SideNav from '@/components/App/SideNav'

export default {
  components: {
    Tasks,
    SideNav
  },
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      if (!vm.attributes.length) await vm.prepareAttributes()

      if (vm.tasks.length) await vm.prepareTasks()
    })
  },
  computed: {
    ...mapState('attribute', { attributes: 'items' }),
    ...mapState('task', { tasks: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })
  },
  methods: {
    ...mapActions('attribute', {
      setAttributes: 'setItems',
      reset: 'reset'
    }),
    ...mapActions('task', { updateTask: 'updateItem' }),
    ...mapActions('setting', { setSettings: 'setItems' }),

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
