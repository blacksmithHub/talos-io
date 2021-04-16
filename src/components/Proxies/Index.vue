<template>
  <div>
    <v-layout
      v-resize="onResize"
      fluid
    >
      <v-data-table
        :height="windowSize.y - 50 - 10 - 45 - 22"
        style="width: 100%"
        class="elevation-2"
        no-data-text="Nothing to display"
        no-results-text="Nothing to display"
        :headers="headers"
        :items="proxies"
        item-key="id"
        hide-default-footer
        :items-per-page="proxies.length"
        fixed-header
        disable-pagination
      >
        <template v-slot:top>
          <Header />
          <v-divider style="border:1px solid #d85820" />
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.name"
            />
          </div>
        </template>

        <template v-slot:[`item.proxies`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.proxies.length"
            />
          </div>
        </template>

        <template v-slot:[`item.configs`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.configs.filter((el) => el.options).length"
            />
          </div>
        </template>

        <template v-slot:item.actions="{item}">
          <div>
            <v-btn
              v-if="item.status === status.STOPPED"
              icon
              color="brown"
              depressed
              @click="onStart(item)"
            >
              <v-icon
                small
                v-text="'mdi-cookie'"
              />
            </v-btn>

            <v-btn
              v-else
              icon
              color="error"
              depressed
              :loading="item.loading"
              @click="onStop(item)"
            >
              <v-icon
                small
                v-text="'mdi-stop'"
              />
            </v-btn>

            <v-btn
              icon
              color="warning"
              depressed
              :disabled="item.status === status.RUNNING || item.loading"
              @click="$refs.proxyDialog.onEdit(item.id)"
            >
              <v-icon
                small
                v-text="'mdi-pencil'"
              />
            </v-btn>

            <v-btn
              icon
              color="red"
              depressed
              :disabled="item.loading"
              @click="onDelete(item)"
            >
              <v-icon
                small
                v-text="'mdi-delete'"
              />
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-layout>

    <ProxyDialog ref="proxyDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Cookie } from 'tough-cookie'

import Header from '@/components/Proxies/Header.vue'
import ProxyDialog from '@/components/Proxies/ProxyDialog.vue'

import Constant from '@/config/constant'
import Config from '@/config/app'
import CF from '@/services/cloudflare-bypass'

export default {
  components: {
    Header,
    ProxyDialog
  },
  data () {
    return {
      headers: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'No. of Proxies',
          value: 'proxies'
        },
        {
          text: 'No. of Cookies',
          value: 'configs'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'center',
          filterable: false,
          sortable: false
        }
      ],
      windowSize: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapState('proxy', { proxies: 'items' }),
    status () {
      return Constant.STATUS
    }
  },
  methods: {
    ...mapActions('proxy', { updateProxy: 'updateItem', deleteProxy: 'deleteItem' }),

    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    async onStart (item) {
      if (item.status === this.status.RUNNING) return false

      let configs = item.configs.map(el => {
        delete el.options
        return el
      })

      this.updateProxy({
        ...item,
        status: this.status.RUNNING,
        configs: configs
      })

      for (let index = 0; index < item.proxies.length; index++) {
        let proxy = this.proxies.find((el) => el.id === item.id)

        if (proxy.status === this.status.STOPPED) break

        const UserAgent = require('user-agents')
        let userAgent = new UserAgent()
        userAgent = userAgent.toString()
        const conf = item.configs.find((el) => el.proxy === item.proxies[index].proxy)

        const site = Config.services.titan22.url
        const Url = require('url-parse')
        const url = new Url(site)

        const request = conf.rp({
          url: site,
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
            referer: `${url.protocol}//${url.host}/`
          },
          proxy: item.proxies[index].proxy,
          jar: conf.jar
        })

        configs = configs.map(el => {
          if (el.proxy === item.proxies[index].proxy) el.request = request

          return el
        })

        proxy = this.proxies.find((el) => el.id === item.id)

        this.updateProxy({
          ...proxy,
          configs: configs
        })

        await request
          .then((res) => {
            if (index + 1 === item.proxies.length) {
              proxy = this.proxies.find((el) => el.id === item.id)

              this.updateProxy({
                ...proxy,
                configs: configs,
                status: this.status.STOPPED
              })
            }

            return res
          })
          .catch(async (err) => {
            if (err.statusCode === 503 || err.statusCode === 403) {
              const { options } = err
              const { jar } = options

              const cookies = await CF.bypass(options, item.id)

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

                  jar.setCookie(val, options.headers.referer)
                }

                configs = configs.map(el => {
                  if (el.proxy === item.proxies[index].proxy) el.options = options

                  return el
                })
              }
            }

            proxy = this.proxies.find((el) => el.id === item.id)

            const obj = {
              ...proxy,
              configs: configs
            }

            if (index + 1 === item.proxies.length) obj.status = this.status.STOPPED

            this.updateProxy(obj)

            return err
          })
      }
    },
    onStop (item) {
      for (let index = 0; index < item.configs.length; index++) {
        try {
          const conf = item.configs[index]
          if (conf.request) conf.request.cancel()
        } catch (error) {
          //
        }
      }

      this.updateProxy({
        ...item,
        status: this.status.STOPPED
      })
    },
    async onDelete (item) {
      const index = this.proxies.findIndex((el) => el.id === item.id)
      await this.onStop(item)
      this.deleteProxy(index)
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
