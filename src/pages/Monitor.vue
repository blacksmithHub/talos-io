<template>
  <v-app>
    <v-main>
      <VersionUpdate
        v-if="alertMsg"
        :alert-msg="alertMsg"
        :alert-class="alertClass"
      />
      <v-container>
        <v-card>
          <v-card-title>
            <v-row>
              <v-col align-self="center">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  hide-details
                  outlined
                  dense
                />
              </v-col>

              <v-col
                align-self="center"
                cols="3"
              >
                <v-select
                  v-model="filter"
                  :items="items"
                  outlined
                  dense
                  hide-details
                  item-text="title"
                  item-value="value"
                  label="Filter By"
                />
              </v-col>
            </v-row>
          </v-card-title>

          <v-card-text style="max-height: 75vh; overflow: auto;">
            <v-data-table
              dense
              :headers="headers"
              :items="products"
              :search="search"
              :loading="loading || !products.length"
              hide-default-footer
              loading-text="Loading... Please wait"
              :items-per-page="products.length"
              :no-results-text="'Nothing to display'"
              :no-data-text="'Nothing to display'"
            >
              <template v-slot:item.name="{ value }">
                <small v-text="value" />
              </template>

              <template v-slot:item.sku="{ value }">
                <small v-text="value" />
              </template>

              <template v-slot:item.price="{ value }">
                <small v-text="value" />
              </template>

              <template v-slot:item.link="{ value }">
                <small
                  class="text-capitalize text-decoration-underline primary--text cursor"
                  @click="redirect(value)"
                  v-text="'product link'"
                />
              </template>

              <template v-slot:item.status="{ value }">
                <v-chip
                  class="text-capitalize"
                  x-small
                  :color="(value) ? 'error' : 'success'"
                  v-text="(value) ? 'out of stock' : 'in stock'"
                />
              </template>

              <template v-slot:item.date="{ value }">
                <small v-text="value" />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState, mapActions } from 'vuex'

import moment from '@/mixins/moment'
import App from '@/config/app'
import productApi from '@/api/magento/titan22/product'
import Footer from '@/components/App/Footer'
import VersionUpdate from '@/components/App/VersionUpdate'

export default {
  components: { Footer, VersionUpdate },
  mixins: [moment],
  data () {
    return {
      alertMsg: '',
      alertClass: '',
      items: [
        { title: 'Last created', value: 'created_at' },
        { title: 'Last update', value: 'updated_at' }
      ],
      filter: 'updated_at',
      interval: null,
      loading: false,
      search: '',
      headers: [
        {
          text: 'Product',
          sortable: false,
          value: 'name',
          width: '8%'
        },
        {
          text: 'SKU',
          value: 'sku',
          width: '8%'
        },
        {
          text: 'Price',
          value: 'price',
          width: '3%'
        },
        {
          text: 'Link',
          sortable: false,
          value: 'link',
          width: '5%',
          align: 'center'
        },
        {
          text: 'Status',
          value: 'status',
          width: '3%',
          align: 'center'
        },
        {
          text: 'Date',
          value: 'date',
          width: '10%'
        }
      ],
      products: [],
      active: false
    }
  },
  computed: {
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

    ipcRenderer.on('init', (event, arg) => {
      if (arg) {
        this.active = true
        this.searchProduct(() => {})
      }
    })

    ipcRenderer.on('stop', (event, arg) => {
      if (arg) this.active = false
    })

    ipcRenderer.on('versionUpdate', (event, arg) => {
      this.alertMsg = arg.msg
      this.alertClass = arg.class
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),

    /**
     * Redirect to product link.
     *
     */
    redirect (slug) {
      const { shell } = require('electron')
      shell.openExternal(`${App.services.titan22.url}/${slug}.html`)
    },

    /**
     * Search product API.
     *
     */
    async searchProduct (callback) {
      let status = this.active
      let interval = this.settings.monitorInterval

      while (status) {
        status = this.active

        if (!status) break

        const params = {
          searchCriteria: {
            sortOrders: [
              {
                field: this.filter,
                direction: 'DESC'
              }
            ],
            pageSize: 100
          }
        }

        this.loading = true

        const response = await productApi.search(params, App.services.titan22.token)

        if (response) {
          this.products = []

          response.items.forEach(element => {
            const link = element.custom_attributes.find((val) => val.attribute_code === 'url_key')

            this.products.push({
              name: element.name,
              sku: element.sku,
              price: element.price,
              link: (link) ? link.value : '',
              status: element.extension_attributes.out_of_stock,
              date: this.formatDate(element.updated_at)
            })
          })
        }

        this.loading = false

        interval = this.settings.monitorInterval

        await new Promise(resolve => setTimeout(resolve, interval))
      }

      callback(this.active)
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: pointer;
}
</style>
