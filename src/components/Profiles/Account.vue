<template>
  <div>
    <v-layout
      v-resize="onResize"
      fluid
    >
      <v-data-table
        :height="windowSize.y - 65 - 25 - 60 - 37"
        style="width: 100%"
        class="elevation-2"
        no-data-text="Nothing to display"
        no-results-text="Nothing to display"
        :headers="headers"
        :items="accounts"
        item-key="id"
        hide-default-footer
        :items-per-page="accounts.length"
        fixed-header
        disable-pagination
      >
        <template v-slot:top>
          <AccountHeader @paypalLogin="paypalLogin" />
          <v-divider style="border:1px solid #d85820" />
        </template>

        <template v-slot:footer>
          <v-divider style="border:1px solid #d85820" />
          <v-row
            align="center"
            class="py-3 px-3"
            no-gutters
            justify="center"
          >
            <v-col
              align-self="center"
              cols="6"
            >
              <v-autocomplete
                v-model="proxyList"
                :items="proxies"
                outlined
                dense
                label="Proxy List"
                item-text="name"
                return-object
                hide-details
              />
            </v-col>
          </v-row>
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

        <template v-slot:[`item.email`]="{ item }">
          <div
            class="row cursor"
            style="width: 100px"
          >
            <div class="col-12 text-truncate">
              {{ (item.paypal.account) ? item.paypal.account.paypalAccounts[0].details.payerInfo.payerId : 'none' }}
            </div>
          </div>
        </template>

        <template v-slot:[`item.password`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div class="col-12 text-truncate">
              {{ (item.paypal.account) ? item.paypal.account.paypalAccounts[0].details.correlationId : 'none' }}
            </div>
          </div>
        </template>

        <template v-slot:item.actions="{item}">
          <div>
            <v-btn
              icon
              color="paypalLogin"
              depressed
              :loading="item.loading"
              @click="paypalLogin(item)"
            >
              <vue-fontawesome icon="paypal" />
            </v-btn>

            <v-btn
              icon
              color="warning"
              depressed
              :disabled="item.loading"
              @click="$refs.accountDialog.onEdit(item.id)"
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
              @click="deleteAccount(item)"
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

    <AccountDialog ref="accountDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Cookie } from 'tough-cookie'

import AccountHeader from '@/components/Profiles/AccountHeader.vue'
import AccountDialog from '@/components/Profiles/AccountDialog.vue'

import BraintreeApi from '@/api/magento/titan22/braintree'
import CF from '@/services/cloudflare-bypass'
import Config from '@/config/app'

export default {
  components: {
    AccountHeader,
    AccountDialog
  },
  data () {
    return {
      headers: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'PayPal Payer ID',
          value: 'email'
        },
        {
          text: 'PayPal Token',
          value: 'password'
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
      },
      proxyList: {}
    }
  },
  computed: {
    ...mapState('account', { accounts: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
    ...mapState('settings', { settings: 'items' })
  },
  watch: {
    proxyList () {
      this.setSettings({
        ...this.settings,
        accountProxyList: { ...this.proxyList }
      })
    }
  },
  created () {
    this.proxyList = (this.settings.accountProxyList && Object.keys(this.settings.accountProxyList).length)
      ? { ...this.settings.accountProxyList }
      : { ...this.proxies.slice().find((val) => val.id === 1) }

    this.setSettings({
      ...this.settings,
      accountProxyList: { ...this.proxyList }
    })
  },
  methods: {
    ...mapActions('account', { updateAccount: 'updateItem', deleteAccount: 'deleteItem' }),
    ...mapActions('snackbar', ['showSnackbar']),
    ...mapActions('settings', { setSettings: 'setItems' }),

    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    async paypalLogin (item) {
      if (item.loading) return false

      let data = this.accounts.find((el) => el.id === item.id)

      this.updateAccount({
        ...data,
        loading: true,
        paypal: {
          ...item.paypal,
          account: null
        }
      })

      let index = 0

      if (this.proxyList.configs.length > 1) index = Math.floor(Math.random() * this.proxyList.configs.length)

      const UserAgent = require('user-agents')
      let userAgent = new UserAgent()
      userAgent = userAgent.toString()
      const rp = this.proxyList.configs[index].rp
      const jar = this.proxyList.configs[index].jar

      const secret = await this.getSecret(rp, jar, userAgent)

      if (!secret || secret.error) {
        data = this.accounts.find((el) => el.id === item.id)

        this.updateAccount({
          ...data,
          loading: false
        })

        return false
      }

      const fingerprint = JSON.parse(atob(JSON.parse(secret))).authorizationFingerprint

      const resource = await this.getResource(rp, jar, userAgent, fingerprint)

      if (!resource) {
        data = this.accounts.find((el) => el.id === item.id)

        this.updateAccount({
          ...data,
          loading: false
        })

        return false
      }

      const auth = await this.authenticatePaypal(JSON.parse(resource).paymentResource.redirectUrl, userAgent)

      if (!auth) {
        data = this.accounts.find((el) => el.id === item.id)

        this.updateAccount({
          ...data,
          loading: false
        })

        return false
      }

      const account = await this.getAccount(rp, jar, userAgent, auth, fingerprint)

      data = this.accounts.find((el) => el.id === item.id)

      if (!account) {
        this.updateAccount({
          ...data,
          loading: false
        })

        return false
      }

      this.updateAccount({
        ...data,
        loading: false,
        paypal: {
          ...data.paypal,
          account: JSON.parse(account),
          expires_in: this.$moment().add(150, 'minutes').toISOString()
        }
      })
    },
    /**
     * Fetch site secret
     */
    async getSecret (rp, jar, userAgent) {
      try {
        let data = null
        let tries = 0

        const params = {
          config: {
            rp: rp,
            jar: jar,
            userAgent: userAgent
          }
        }

        while (!data) {
          tries++

          if (tries > 3) break

          const response = await BraintreeApi.getSecret(params)

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

              params.config.options = options
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
     * Fetch paypal resource
     */
    async getResource (rp, jar, userAgent, fingerprint) {
      const params = {
        payload: {
          returnUrl: Config.services.auth.url,
          cancelUrl: Config.services.auth.url,
          offerPaypalCredit: false,
          amount: 1,
          currencyIsoCode: 'PHP',
          braintreeLibraryVersion: Config.services.braintree.version,
          authorizationFingerprint: fingerprint
        },
        config: {
          rp: rp,
          jar: jar,
          userAgent: userAgent
        }
      }

      const response = await BraintreeApi.createPaymentResource(params)

      if (!response || response.error) return null

      return response
    },
    /**
     * Authenticate user
     */
    async authenticatePaypal (redirectUrl, userAgent) {
      let data = null

      const vanillaPuppeteer = require('puppeteer')
      const { addExtra } = require('puppeteer-extra')
      const StealthPlugin = require('puppeteer-extra-plugin-stealth')

      const puppeteer = addExtra(vanillaPuppeteer)
      const stealth = StealthPlugin()
      puppeteer.use(stealth)

      const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--window-size=560,638',
          `--user-agent=${userAgent}`
        ],
        executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'),
        headless: false
      })

      try {
        const page = await browser.newPage()

        await page.goto(redirectUrl)

        let url = await page.url()

        while (!url.includes(Config.services.auth.domain)) {
          await page.waitForNavigation({
            timeout: 0,
            waitUntil: 'domcontentloaded'
          })

          url = await page.url()

          if (url.includes(Config.services.auth.domain)) {
            const domain = `${Config.services.auth.url}/?`
            const queries = url.slice(domain.length).split('&')
            const params = {}

            queries.forEach(element => {
              const query = element.split('=')
              params[query[0]] = query[1]
            })

            data = params
            break
          }
        }

        browser.close()

        return data
      } catch (error) {
        console.log(error)

        try {
          browser.close()
        } catch (error) {
          console.log(error)
        }

        return null
      }
    },
    /**
     * Fetch paypal account
     */
    async getAccount (rp, jar, userAgent, auth, fingerprint) {
      const params = {
        payload: {
          paypalAccount: {
            correlationId: auth.token,
            paymentToken: auth.paymentId,
            payerId: auth.PayerID,
            unilateral: true,
            intent: 'authorize'
          },
          braintreeLibraryVersion: Config.services.braintree.version,
          authorizationFingerprint: fingerprint
        },
        config: {
          rp: rp,
          jar: jar,
          userAgent: userAgent
        }
      }

      const response = await BraintreeApi.getPaypalAccount(params)

      if (!response || response.error) return null

      return response
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
