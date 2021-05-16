<template>
  <v-app>
    <v-app-bar
      app
      dense
      class="titleBar"
    >
      <v-row no-gutters>
        <v-col
          cols="1"
          class="titleBar"
          align-self="center"
        >
          <div class="d-flex align-center">
            <v-img
              class="shrink mr-2"
              contain
              :src="require('@/assets/talos.png')"
              transition="scale-transition"
              width="35"
            />
          </div>
        </v-col>

        <v-col align-self="center">
          <h4
            class="mt-1 ml-3"
            v-text="'Monitor'"
          />
        </v-col>

        <v-col>
          <v-row
            no-gutters
            class="text-right mt-1"
            justify="center"
            align="center"
          >
            <v-col align-self="center">
              <v-btn
                icon
                x-small
                :ripple="false"
                class="mr-1"
                @click="onMaximize"
              >
                <v-icon
                  small
                  color="success"
                  v-text="'mdi-checkbox-blank-circle'"
                />
              </v-btn>

              <v-btn
                icon
                x-small
                :ripple="false"
                class="mr-1"
                @click="onMinimize"
              >
                <v-icon
                  small
                  color="warning"
                  v-text="'mdi-checkbox-blank-circle'"
                />
              </v-btn>

              <v-btn
                icon
                x-small
                :ripple="false"
                @click="onClose"
              >
                <v-icon
                  small
                  color="error"
                  v-text="'mdi-checkbox-blank-circle'"
                />
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-layout
          v-resize="onResize"
          fluid
        >
          <v-data-table
            :height="windowSize.y - 86 - 46 - 81 - 58"
            style="width: 100%"
            class="elevation-2"
            no-data-text="Nothing to display"
            no-results-text="Nothing to display"
            :headers="headers"
            :items="products"
            item-key="id"
            hide-default-footer
            fixed-header
            disable-sort
            mobile-breakpoint="100"
            hide-default-header
            :loading="loading"
            :search="search"
            :items-per-page="100"
            :page.sync="page"
            @page-count="pageCount = $event"
          >
            <template v-slot:top>
              <v-row
                align="center"
                justify="center"
                class="pa-3"
              >
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
              </v-row>

              <v-divider />
            </template>

            <template v-slot:footer>
              <v-divider style="border:1px solid #d85820" />
              <v-pagination
                v-model="page"
                class="my-3"
                :length="pageCount"
                :total-visible="8"
                circle
              />
              <v-row
                align="center"
                justify="center"
                class="text-center pa-3"
              >
                <v-col>
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

                <v-col cols="4">
                  <v-text-field
                    v-model="count"
                    label="Items"
                    hide-details
                    outlined
                    dense
                  />
                </v-col>

                <v-col
                  cols="3"
                  class="text-center"
                  align-self="center"
                >
                  <v-btn
                    depressed
                    small
                    rounded
                    outlined
                    color="primary"
                    :loading="loading"
                    @click="applyFilter"
                  >
                    Apply
                  </v-btn>
                </v-col>
              </v-row>
            </template>

            <template v-slot:item.actions="{item}">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-clipboard:copy="item.sku"
                    v-clipboard:success="() => {showSnackbar({ message: `You just copied: ${item.sku}`, color: 'teal' })}"
                    icon
                    color="primary"
                    depressed
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon
                      small
                      v-text="'mdi-content-copy'"
                    />
                  </v-btn>
                </template>
                <span v-text="'Copy SKU'" />
              </v-tooltip>
            </template>

            <template v-slot:item.img="{ value }">
              <v-img
                :lazy-src="lazyImg"
                :src="value"
                width="80"
              />
            </template>

            <template v-slot:item.name="{ item }">
              <div class="pa-1">
                <p
                  class="font-weight-bold caption blue--text caption pa-0 ma-0 text-decoration-underline cursor"
                  @click="redirect(item.link)"
                  v-text="item.name"
                />
                <v-row
                  no-gutters
                  justify="center"
                >
                  <v-col align-self="center">
                    <p
                      class="caption pa-0 ma-0 text"
                      v-text="item.sku"
                    />
                    <p
                      class="caption pa-0 ma-0 text"
                      v-text="`Php ${item.price}`"
                    />
                  </v-col>

                  <v-col align-self="center">
                    <p
                      class="caption pa-0 ma-0 text"
                      v-text="item.date"
                    />
                  </v-col>
                </v-row>
              </div>
            </template>

            <template v-slot:item.sku="{}" />

            <template v-slot:item.status="{ value }">
              <v-icon
                small
                :color="value ? 'red' : 'green'"
                v-text="'mdi-checkbox-blank-circle'"
              />
            </template>
          </v-data-table>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { remote, ipcRenderer } from 'electron'
import { Cookie } from 'tough-cookie'
import UserAgent from 'user-agents'

import ProductApi from '@/api/magento/titan22/product'

import CF from '@/services/cloudflare-bypass'
import Config from '@/config/app'
import placeholder from '@/assets/no_image.png'

export default {
  data () {
    return {
      page: 1,
      pageCount: 0,
      search: '',
      loading: false,
      count: 500,
      filter: 'updated_at',
      filterItems: [
        { title: 'Last created', value: 'created_at' },
        { title: 'Last update', value: 'updated_at' }
      ],
      headers: [
        {
          value: 'actions',
          align: 'center',
          filterable: false,
          sortable: false
        },
        {
          value: 'img'
        },
        {
          value: 'name'
        },
        {
          value: 'sku'
        },
        {
          value: 'status'
        }
      ],
      products: [],
      windowSize: {
        x: 0,
        y: 0
      },
      loop: null,
      params: {
        payload: {
          searchCriteria: {
            sortOrders: [
              {
                field: null,
                direction: 'DESC'
              }
            ],
            pageSize: null
          }
        },
        token: null,
        config: null
      }
    }
  },
  computed: {
    ...mapState('settings', { settings: 'items' }),
    ...mapState('monitor', { monitor: 'items' }),
    lazyImg () {
      return placeholder
    }
  },
  watch: {
    settings () {
      this.$vuetify.theme.dark = this.settings.nightMode
    }
  },
  async created () {
    await this.prepareData()

    this.searchProduct()

    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(JSON.parse(arg))
    })
  },
  methods: {
    ...mapActions('settings', { setSettings: 'setItems' }),
    ...mapActions('snackbar', ['showSnackbar']),
    ...mapActions('monitor', { updateMonitor: 'setItems' }),

    prepareData () {
      this.count = this.monitor.total
      this.filter = this.monitor.filter

      this.params.payload.searchCriteria.sortOrders[0].field = this.filter
      this.params.payload.searchCriteria.pageSize = this.count
      this.params.token = Config.services.titan22.token

      this.proxyList = { ...this.settings.monitorProxy }

      this.proxyList.configs = []

      const userAgent = new UserAgent({ deviceCategory: 'desktop' })

      if (this.proxyList.proxies && this.proxyList.proxies.length) {
        this.proxyList.proxies.forEach((el) => {
          const rp = require('request-promise')
          const jar = rp.jar()

          this.proxyList.configs.push({
            rp: rp,
            jar: jar,
            proxy: el.proxy,
            userAgent: userAgent
          })
        })
      } else {
        const rp = require('request-promise')
        const jar = rp.jar()

        this.proxyList.configs.push({
          rp: rp,
          jar: jar,
          userAgent: userAgent
        })
      }
    },
    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    onClose () {
      remote.getCurrentWindow().close()
    },
    onMaximize () {
      const win = remote.getCurrentWindow()

      if (!win.isMaximized()) {
        win.maximize()
      } else {
        win.unmaximize()
      }
    },
    onMinimize () {
      remote.getCurrentWindow().minimize()
    },
    async searchProduct () {
      this.loading = true

      const response = await this.fetchProduct()

      if (response) {
        this.products = []

        const data = JSON.parse(response)

        const allProducts = data.items.map(element => {
          const link = element.custom_attributes.find((val) => val.attribute_code === 'url_key')
          const image = element.custom_attributes.find((val) => val.attribute_code === 'image')

          return {
            img: (image) ? `${Config.services.titan22.url}/media/catalog/product${image.value}` : placeholder,
            name: element.name,
            sku: element.sku,
            price: element.price.toLocaleString(),
            link: (link) ? link.value : '',
            status: element.extension_attributes.out_of_stock,
            date: element.updated_at
          }
        })

        this.products = allProducts
      }

      this.loading = false

      const vm = this
      this.loop = setTimeout(vm.searchProduct, vm.settings.monitorInterval)
    },
    async fetchProduct () {
      try {
        let tries = 0
        let data = null

        while (!data) {
          tries++

          if (tries > 3) break

          if (this.settings.monitorProxy && Object.keys(this.settings.monitorProxy).length) await this.assignProxy()

          const response = await ProductApi.search(this.params)

          if (response.error && (response.error.statusCode === 503 || response.error.statusCode === 403)) {
            this.showSnackbar({ message: 'Please wait...' })

            const { options } = response.error
            const { jar } = options

            const cookies = await CF.bypass(options)

            if (cookies.length) {
              for (const cookie of cookies) {
                const { name, value, expires, domain, path } = cookie

                const expiresDate = new Date(expires * 1000)

                const val = new Cookie({
                  key: name,
                  value,
                  expires: expiresDate,
                  domain: domain.startsWith('.') ? domain.substring(1) : domain,
                  path
                }).toString()

                jar.setCookie(val, Config.services.titan22.url)
              }

              this.proxyList.configs = this.proxyList.configs.map((el) => {
                if (el.proxy === options.proxy) el.options = options

                return el
              })
            }
          } else if (response.error) {
            data = null
          } else {
            data = response
          }
        }

        return data
      } catch (error) {
        console.log(error)
        return null
      }
    },

    /**
     * Redirect to product link.
     */
    redirect (slug) {
      const { shell } = require('electron')
      shell.openExternal(`${Config.services.titan22.url}/${slug}.html`)
    },

    applyFilter () {
      this.updateMonitor({
        filter: this.filter,
        total: this.count
      })

      this.params.payload.searchCriteria.sortOrders[0].field = this.filter
      this.params.payload.searchCriteria.pageSize = this.count
      clearTimeout(this.loop)
      this.searchProduct()
    },

    assignProxy () {
      let index = 0

      if (this.proxyList.configs.length > 1) index = Math.floor(Math.random() * this.proxyList.configs.length)

      const selected = this.proxyList.configs[index]

      this.params.config = selected
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: pointer;
}
.text {
  cursor: default;
}
</style>
