<template>
  <div class="pa-5">
    <v-card>
      <v-card-title style="border-bottom: 1px solid #d85820">
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
              :items="filterItems"
              outlined
              dense
              hide-details
              item-text="title"
              item-value="value"
              label="Filter By"
            />
          </v-col>

          <v-col
            align-self="center"
            cols="2"
          >
            <v-text-field
              v-model="count"
              label="Items"
              hide-details
              outlined
              dense
              @change="onCountChange"
            />
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-card-text>
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
          fixed-header
          height="65vh"
        >
          <template v-slot:item.img="{ value }">
            <v-img
              :src="value"
              width="80"
            />
          </template>

          <template v-slot:item.name="{ value }">
            <small v-text="value" />
          </template>

          <template v-slot:item.sku="{ value }">
            <small v-text="value" />

            <v-icon
              v-clipboard:copy="value"
              v-clipboard:success="onCopy"
              small
              right
              class="cursor"
              v-text="'mdi-content-copy'"
            />
          </template>

          <template v-slot:item.price="{ value }">
            <small v-text="`Php ${value}`" />
          </template>

          <template v-slot:item.link="{ value }">
            <small
              class="text-capitalize text-decoration-underline primary--text cursor"
              @click="redirect(value)"
              v-text="'product'"
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

      <v-divider />

      <v-card-actions>
        <v-row no-gutters>
          <v-col cols="6">
            <small
              style="max-width: 100%"
              class="text-capitalize text-truncate d-inline-block"
              v-text="`total: ${products.length}`"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState, mapActions } from 'vuex'

import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

import moment from '@/mixins/moment'
import App from '@/config/app'
import productApi from '@/api/magento/titan22/product'
import placeholder from '@/assets/no_image.png'

export default {
  mixins: [moment],
  data () {
    return {
      count: 100,
      filterItems: [
        { title: 'Last created', value: 'created_at' },
        { title: 'Last update', value: 'updated_at' }
      ],
      filter: 'updated_at',
      interval: null,
      loading: false,
      search: '',
      headers: [
        {
          sortable: false,
          value: 'img',
          width: '1%'
        },
        {
          text: 'Product',
          sortable: false,
          value: 'name',
          width: '10%'
        },
        {
          text: 'SKU',
          value: 'sku',
          width: '10%'
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
          width: '1%',
          align: 'center'
        },
        {
          text: 'Status',
          value: 'status',
          width: '2%',
          align: 'center'
        },
        {
          text: 'Date',
          value: 'date',
          width: '11%'
        }
      ],
      products: [],
      loop: null
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' })
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    'settings.monitorInterval': function () {
      clearInterval(this.loop)
      this.searchProduct()
    },
    'settings.monitorProxy': function () {
      clearInterval(this.loop)
      this.searchProduct()
    },
    filter () {
      clearInterval(this.loop)
      this.searchProduct()
    }
  },
  async created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })
    await this.fetchProducts()
    const vm = this
    setTimeout(() => (vm.searchProduct()), vm.settings.monitorInterval)
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('core', ['setDialogComponent', 'setDialog']),

    /**
     * on count field change
     */
    onCountChange () {
      clearInterval(this.loop)
      this.searchProduct()
    },
    /**
     * On copy event.
     *
     */
    onCopy (e) {
      Toastify({
        text: `You just copied: ${e.text}`,
        duration: 3000,
        newWindow: true,
        close: false,
        gravity: 'bottom',
        position: 'left',
        backgroundColor: '#399cbd',
        className: 'toastify'
      }).showToast()
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
      const interval = this.settings.monitorInterval
      const vm = this
      this.loop = setInterval(async () => {
        await vm.fetchProducts()
      }, interval)
    },
    /**
     * API call to backend.
     *
     */
    async fetchProducts () {
      try {
        const params = {
          payload: {
            searchCriteria: {
              sortOrders: [
                {
                  field: this.filter,
                  direction: 'DESC'
                }
              ],
              pageSize: this.count
            }
          },
          token: App.services.titan22.token
        }

        if (this.settings.monitorProxy) params.proxy = this.settings.monitorProxy

        this.loading = true
        const response = await productApi.search(params)

        this.products = []

        if (response && !response.error) {
          JSON.parse(response).items.forEach(element => {
            const link = element.custom_attributes.find((val) => val.attribute_code === 'url_key')
            const image = element.custom_attributes.find((val) => val.attribute_code === 'image')
            this.products.push({
              img: (image) ? `${App.services.titan22.url}/media/catalog/product${image.value}` : placeholder,
              name: element.name,
              sku: element.sku,
              price: element.price.toLocaleString(),
              link: (link) ? link.value : '',
              status: element.extension_attributes.out_of_stock,
              date: this.formatDate(element.updated_at)
            })
          })
        } else if (response.error && response.error.statusCode && response.error.statusCode === 503) {
          // TODO: cf clearance
        } else {
          this.setDialogComponent({ header: 'Error', content: response.error })
          this.setDialog(true)
        }
        this.loading = false
      } catch (error) {
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
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
