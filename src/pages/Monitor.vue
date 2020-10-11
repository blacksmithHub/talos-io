<template>
  <v-container>
    <v-card class="mt-5">
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>

      <v-card-text style="max-height: 80vh; overflow: auto;">
        <v-data-table
          dense
          :headers="headers"
          :items="products"
          :search="search"
          :loading="loading"
          hide-default-footer
          loading-text="Loading... Please wait"
          :items-per-page="products.length"
          :no-results-text="'No result found'"
          :no-data-text="'No data found'"
        >
          <template v-slot:item.name="{ value }">
            <small>{{ value }}</small>
          </template>

          <template v-slot:item.sku="{ value }">
            <small>{{ value }}</small>
          </template>

          <template v-slot:item.size="{ value }">
            <small>{{ value }}</small>
          </template>

          <template v-slot:item.price="{ value }">
            <small>{{ value }}</small>
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

          <template v-slot:item.last_update="{ value }">
            <small>{{ value }}</small>
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
          width: '5%'
        },
        {
          text: 'Size',
          value: 'size',
          width: '3%'
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
          text: 'Last Update',
          value: 'last_update',
          width: '10%'
        }
      ],
      products: []
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
      if (arg) this.init()
    })

    ipcRenderer.on('stop', (event, arg) => {
      if (arg) this.stop()
    })

    this.searchProduct()
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),

    init () {
      //
    },
    stop () {
      //
    },

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
    async searchProduct () {
      const params = {
        searchCriteria: {
          pageSize: 100,
          sortOrders: [
            {
              field: 'updated_at',
              direction: 'DESC'
            }
          ]
        }
      }

      const response = await productApi.search(params, App.services.titan22.token)

      if (response) {
        response.items.forEach(element => {
          const sku = element.sku.split('-')

          this.products.push({
            name: element.name,
            sku: `${sku[0]}-${sku[1]}`,
            size: sku[2],
            price: element.price,
            link: element.custom_attributes.find((val) => val.attribute_code === 'url_key').value,
            status: element.extension_attributes.out_of_stock,
            last_update: this.formatDate(element.updated_at)
          })
        })
      }
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: pointer;
}
</style>
