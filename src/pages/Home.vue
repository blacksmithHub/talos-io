<template>
  <v-app>
    <!-- <Sidenav /> -->
    <v-main>
      <Tasks />
    </v-main>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

// import Sidenav from '@/components/App/Sidenav'
import Tasks from '@/components/Tasks'
import productApi from '@/services/magento/titan22/api/product'
import App from '@/config/app'

export default {
  components: {
    // Sidenav,
    Tasks
  },
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      await vm.prepareAttributes()
    })
  },
  data () {
    return {
      //
    }
  },
  methods: {
    ...mapActions('attribute', {
      setAttributes: 'setItems',
      reset: 'reset'
    }),

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

      const response = {
        attribute_id: attribute.items[0].attribute_id,
        sizes: attribute.items[0].options.filter((data) => data.value)
      }

      return response
    }
  }
}
</script>
