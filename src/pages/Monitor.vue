<template>
  <v-container>
    <v-card class="mt-5">
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

      <v-card-text style="max-height: 80vh; overflow: auto;">
        <v-data-table
          dense
          :headers="headers"
          :items="products"
          :search="search"
          :loading="loading || !products.length"
          hide-default-footer
          loading-text="Loading... Please wait"
          :items-per-page="products.length"
          :no-results-text="'No result found'"
          :no-data-text="'No data found'"
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
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState, mapActions } from 'vuex'

import moment from '@/mixins/moment'
import App from '@/config/app'
import productApi from '@/api/magento/titan22/product'

export default {
  mixins: [moment],
  data () {
    return {
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
        this.searchProduct()
      }
    })

    ipcRenderer.on('stop', (event, arg) => {
      if (arg) this.active = false
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
        interval = this.settings.monitorInterval

        await new Promise(resolve => setTimeout(resolve, interval))

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
            this.products.push({
              name: element.name,
              sku: element.sku,
              price: element.price,
              link: element.custom_attributes.find((val) => val.attribute_code === 'url_key').value,
              status: element.extension_attributes.out_of_stock,
              date: this.formatDate(element.updated_at)
            })
          })
        }

        this.loading = false
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
