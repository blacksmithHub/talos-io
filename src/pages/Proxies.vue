<template>
  <v-container>
    <v-card>
      <v-card-title style="border-bottom:1px solid #d85820">
        <v-toolbar
          dense
          rounded
        >
          <v-row
            no-gutters
            justify="center"
          >
            <v-col
              cols="3"
              class="text-center"
            >
              <v-btn
                :fab="!$vuetify.breakpoint.lgAndUp"
                :rounded="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                class="primary"
                depressed
                @click="addNewProxy"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-plus'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'add proxy pool'"
                />
              </v-btn>
            </v-col>

            <v-col
              cols="3"
              class="text-center"
            >
              <v-btn
                :fab="!$vuetify.breakpoint.lgAndUp"
                :rounded="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                class="primary"
                depressed
                @click="importProxies"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-upload'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'import proxies'"
                />
              </v-btn>
            </v-col>

            <v-col
              cols="3"
              class="text-center"
            >
              <v-btn
                :fab="!$vuetify.breakpoint.lgAndUp"
                :rounded="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                class="error"
                depressed
                @click="confirmDeleteAll()"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-delete'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'delete all proxies'"
                />
              </v-btn>
            </v-col>
          </v-row>
        </v-toolbar>
      </v-card-title>

      <v-divider />

      <v-card-text style="max-height: 70vh; overflow: auto">
        <v-list
          v-if="proxies.length"
          class="pa-0"
          three-line
          dense
        >
          <template v-for="(proxy, index) in proxies">
            <v-list-item :key="`${index}-item`">
              <v-list-item-content>
                <v-row no-gutters>
                  <v-col
                    cols="6"
                    align-self="center"
                  >
                    <v-row
                      align="center"
                      no-gutters
                    >
                      <v-col
                        cols="12"
                        align-self="center"
                        class="mb-2"
                      >
                        <h3
                          class="d-inline-block text-truncate"
                          style="max-width: 40vh"
                          v-text="proxy.name"
                        />
                      </v-col>

                      <v-col
                        cols="12"
                        align-self="center"
                      >
                        <v-row no-gutters>
                          <v-col cols="6">
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 40vh"
                            >
                              <span
                                class="text-capitalize font-weight-bold"
                                v-text="'Total:'"
                              />
                              {{ proxy.proxies.length }}
                            </span>
                          </v-col>

                          <v-col cols="6">
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 40vh"
                            >
                              <span
                                class="text-capitalize font-weight-bold"
                                v-text="'Cookies:'"
                              />
                              {{ proxy.configs.filter((el) => el.options).length }}
                            </span>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col
                    align-self="center"
                    class="text-right"
                    cols="6"
                  >
                    <v-btn
                      v-if="proxy.status === Constants.TASK.STATUS.STOPPED"
                      icon
                      color="brown"
                      class="mr-2"
                      @click="onStart(proxy)"
                    >
                      <v-icon v-text="'mdi-cookie'" />
                    </v-btn>

                    <v-btn
                      v-else
                      icon
                      color="warning"
                      class="mr-2"
                      @click="onStop(proxy)"
                    >
                      <v-icon v-text="'mdi-stop'" />
                    </v-btn>

                    <v-btn
                      icon
                      color="primary"
                      class="mr-2"
                      :disabled="proxy.status === Constants.TASK.STATUS.RUNNING"
                      @click="editProxy(proxy)"
                    >
                      <v-icon
                        small
                        v-text="'mdi-pencil'"
                      />
                    </v-btn>

                    <v-btn
                      icon
                      color="error"
                      @click="confirmDelete(index, proxy)"
                    >
                      <v-icon
                        small
                        v-text="'mdi-delete'"
                      />
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>

            <v-divider
              v-if="index < proxies.length - 1"
              :key="`${index}-divider`"
            />
          </template>
        </v-list>

        <v-list v-else>
          <v-list-item class="pa-0 list">
            <v-list-item-content class="pa-2 text-center">
              <small v-text="'Nothing to display'" />
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <ProxyDialog ref="proxyDialog" />
        <ImportProxyDialog ref="importProxyDialog" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-row no-gutters>
          <v-col cols="6">
            <small
              style="max-width: 100%"
              class="text-capitalize text-truncate d-inline-block"
              v-text="`total: ${proxies.length}`"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import ProxyDialog from '@/components/Proxies/ProxyDialog'
import ImportProxyDialog from '@/components/Proxies/ImportProxyDialog'

import Config from '@/config/app'
import Constants from '@/config/constant'

const blockedResources = ['queue-it']

export default {
  components: { ProxyDialog, ImportProxyDialog },
  computed: {
    ...mapState('proxy', { proxies: 'items' }),
    Constants () {
      return Constants
    }
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    proxies () {
      try {
        ipcRenderer.send('update-proxies', JSON.stringify(this.proxies.slice()))
      } catch (error) {
        //
      }
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('dialog', ['openDialog']),
    ...mapActions('proxy', {
      deleteProxy: 'deleteItem',
      reset: 'reset',
      updateProxy: 'updateItem'
    }),

    /**
     * Trigger add new proxies dialog event.
     */
    addNewProxy () {
      this.$refs.proxyDialog.dialog = true
    },
    /**
     * Trigger edit proxies dialog event.
     */
    editProxy (proxy) {
      this.$refs.proxyDialog.mapData(proxy)
    },
    /**
     * Trigger import proxies dialog event.
     */
    importProxies () {
      this.$refs.importProxyDialog.dialog = true
    },

    confirmDeleteAll () {
      if (this.proxies.length) {
        this.openDialog({
          title: 'Confirmation',
          body: 'Are you sure you want to delete all proxy lists?',
          action: () => {
            this.reset()
          }
        })
      }
    },

    confirmDelete (index, proxy) {
      this.openDialog({
        title: 'Confirmation',
        body: 'Are you sure you want to delete this proxy list?',
        action: async () => {
          await this.onStop(proxy)
          this.deleteProxy(index)
        }
      })
    },

    async onStart (proxy) {
      proxy.status = Constants.TASK.STATUS.RUNNING
      proxy.configs = []
      this.updateProxy(proxy)

      for (let index = 0; index < proxy.proxies.length; index++) {
        const rp = require('request-promise')
        const jar = rp.jar()

        const data = {
          host: proxy.proxies[index].host,
          rp: rp,
          jar: jar
        }

        const UserAgent = require('user-agents')
        const userAgent = new UserAgent()

        const site = 'https://cf-js-challenge.sayem.eu.org/' // `${Config.services.titan22.url}/new-arrivals.html`
        const Url = require('url-parse')
        const url = new Url(site)

        const request = rp({
          url: site,
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent.toString(),
            referer: `${url.protocol}//${url.host}/`
          },
          proxy: `http://${proxy.proxies[index].username}:${proxy.proxies[index].password}@${proxy.proxies[index].host}:${proxy.proxies[index].port}`,
          jar: jar
        })

        data.request = request
        proxy.configs.push(data)
        this.updateProxy(proxy)

        await request
          .then((res) => {
            if (index + 1 === proxy.proxies.length) {
              proxy.status = Constants.TASK.STATUS.STOPPED
              this.updateProxy(proxy)
            }
          })
          .catch(async (err) => {
            if (err.statusCode === 503) {
              let options = null

              while (!options) {
                options = await this.generateCookies(err, proxy.id)
                if (options) data.options = options
              }

              proxy.configs = proxy.configs.map((el) => {
                if (el.host === data.host) el = data
                return el
              })

              if (index + 1 === proxy.proxies.length) {
                proxy.status = Constants.TASK.STATUS.STOPPED
                this.updateProxy(proxy)
              }

              return err
            } else if (err.statusCode === 403) {
              let options = null

              while (!options) {
                options = await this.generateCookies(err, proxy.id)
                if (options) data.options = options
              }

              proxy.configs = proxy.configs.map((el) => {
                if (el.host === data.host) el = data
                return el
              })

              if (index + 1 === proxy.proxies.length) {
                proxy.status = Constants.TASK.STATUS.STOPPED
                this.updateProxy(proxy)
              }

              return err
            } else {
              if (index + 1 === proxy.proxies.length) {
                proxy.status = Constants.TASK.STATUS.STOPPED
                this.updateProxy(proxy)
              }

              return err
            }
          })
      }
    },

    onStop (proxy) {
      for (let index = 0; index < proxy.configs.length; index++) {
        try {
          const conf = proxy.configs[index]
          if (conf.request) conf.request.cancel()
        } catch (error) {
          //
        }
      }

      proxy.status = Constants.TASK.STATUS.STOPPED
      this.updateProxy(proxy)
    },

    isRunning (id) {
      const proxy = this.proxies.find((el) => el.id === id)

      if (proxy) return proxy.status === Constants.TASK.STATUS.RUNNING

      return false
    },

    async generateCookies (error, id) {
      const vanillaPuppeteer = require('puppeteer')
      const { addExtra } = require('puppeteer-extra')
      const StealthPlugin = require('puppeteer-extra-plugin-stealth')
      const ProxyChain = require('proxy-chain')
      const { Cookie } = require('tough-cookie')

      let passed = false

      try {
        const { options } = error
        const { jar } = options

        const puppeteer = addExtra(vanillaPuppeteer)
        const stealth = StealthPlugin()
        puppeteer.use(stealth)

        const oldProxyUrl = options.proxy
        const newProxyUrl = await ProxyChain.anonymizeProxy(oldProxyUrl)

        const args = ['--no-sandbox', '--disable-setuid-sandbox', `--user-agent=${options.headers['User-Agent']}`, `--proxy-server=${newProxyUrl}`, '--window-size=500,300']

        const browser = await puppeteer.launch({ args, executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked') })

        if (!this.isRunning(id)) await browser.close()

        const page = await browser.newPage()

        await page.setRequestInterception(true)

        page.on('request', (request) => {
          if (!this.isRunning(id)) browser.close()

          if (request.url().endsWith('.png') || request.url().endsWith('.jpg')) {
            // BLOCK IMAGES
            request.abort()
          } else if (blockedResources.some(resource => request.url().indexOf(resource) !== -1)) {
            // BLOCK CERTAIN DOMAINS
            request.abort()
          } else {
            // ALLOW OTHER REQUESTS
            request.continue()
          }
        })

        page.on('response', () => {
          if (!this.isRunning(id)) browser.close()
        })

        await page.goto(options.url)

        let content = await page.content()

        if (content.includes('cf-browser-verification') && this.isRunning(id)) {
          let counter = 0

          while (content.includes('cf-browser-verification') && this.isRunning(id)) {
            counter++

            if (counter >= 3) break

            await page.waitForNavigation({
              timeout: 45000,
              waitUntil: 'domcontentloaded'
            })

            const cookies = await page.cookies()

            if (!cookies.find((el) => el.name === 'cf_clearance')) {
              content = await page.content()
              continue
            } else {
              passed = true
            }

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

              jar.setCookie(val, 'https://cf-js-challenge.sayem.eu.org/') // Config.services.titan22.url)
            }

            content = await page.content()
          }

          await browser.close()
        } else if (content.includes('cf_captcha_kind') && this.isRunning(id)) {
          await browser.close()

          const browser1 = await puppeteer.launch({ args, executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'), headless: false })

          if (!this.isRunning(id)) await browser1.close()

          const page1 = await browser1.newPage()

          await page1.setRequestInterception(true)

          page1.on('request', (request) => {
            if (!this.isRunning(id)) browser1.close()

            if (request.url().endsWith('.png') || request.url().endsWith('.jpg')) {
            // BLOCK IMAGES
              request.abort()
            } else if (blockedResources.some(resource => request.url().indexOf(resource) !== -1)) {
            // BLOCK CERTAIN DOMAINS
              request.abort()
            } else {
            // ALLOW OTHER REQUESTS
              request.continue()
            }
          })

          page1.on('response', async () => {
            if (!this.isRunning(id)) browser1.close()
          })

          await page1.goto(options.url)

          const content1 = await page1.content()

          const vm = this
          setInterval(async () => {
            if (!vm.isRunning(id)) await browser1.close()
          }, 1000)

          await new Promise((resolve) => {
            (async () => {
              while (content1.includes('cf_captcha_kind') && this.isRunning(id) && !passed) {
                const cookies = await page1.cookies()

                if (!cookies.find((el) => el.name === 'cf_clearance')) {
                  continue
                } else {
                  passed = true
                }

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

                resolve()
              }
            })()
          })

          try {
            await browser1.close()
          } catch (error) {
            //
          }
        } else {
          await browser.close()
        }

        if (passed) return options

        return null
      } catch (error) {
        return null
      }
    }
  }
}
</script>
