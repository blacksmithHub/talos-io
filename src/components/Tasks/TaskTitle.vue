<template>
  <v-card-title>
    <v-row>
      <v-col align-self="center">
        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="cyan mr-3"
          depressed
          @click="$emit('click:verifyAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            color="white"
            v-text="'mdi-shield-search'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'verify all tasks'"
          />
        </v-btn>

        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="mr-3 white--text"
          :class="(paypal && Object.keys(paypal).length) ? 'paypalLogin' : 'paypalLogout'"
          depressed
          :loading="loading"
          @click="(paypal && Object.keys(paypal).length) ? confirm() : paypalLogin()"
        >
          <vue-fontawesome
            icon="paypal"
            size="1"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            class="ml-2"
            v-text="`PayPal ${(paypal && Object.keys(paypal).length) ? 'Logout' : 'Login'}`"
          />
        </v-btn>
      </v-col>

      <v-col>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          hide-details
          outlined
          dense
          @input="onInput"
        />
      </v-col>

      <v-col
        align-self="center"
        class="text-right"
      >
        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="success mr-3"
          depressed
          @click="$emit('click:startAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-play'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'start all'"
          />
        </v-btn>

        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="warning mr-3"
          depressed
          @click="$emit('click:stopAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-stop'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'stop all'"
          />
        </v-btn>

        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="error"
          depressed
          @click="confirmDeleteAll"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-delete'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'delete all'"
          />
        </v-btn>
      </v-col>
    </v-row>
  </v-card-title>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import BraintreeApi from '@/api/magento/titan22/braintree'
import Config from '@/config/app'
import Request from '@/services/request'
import vanillaPuppeteer from 'puppeteer'
import { addExtra } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Cookie } from 'tough-cookie'

const blockedResources = ['queue-it']

export default {
  data () {
    return {
      search: '',
      loading: false
    }
  },
  computed: {
    ...mapState('paypal', { paypal: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('task', { tasks: 'items' })
  },
  created () {
    this.clearAllPaypals()

    ipcRenderer.on('paypalParams', async (event, arg) => {
      if (!arg.profile) {
        const params = {
          payload: {
            paypalAccount: {
              correlationId: arg.params.token,
              paymentToken: arg.params.paymentId,
              payerId: arg.params.PayerID,
              unilateral: true,
              intent: 'authorize'
            },
            braintreeLibraryVersion: Config.services.braintree.version,
            authorizationFingerprint: arg.fingerprint
          }
        }

        const response = await BraintreeApi.getPaypalAccount(params)

        if (response && !response.error) {
          const data = JSON.parse(response)

          data.expiry = this.$moment().add(90, 'minutes').format('HH:mm:ss')

          this.setPaypal(data)
          this.validatePaypal(data)

          this.loading = false
        } else {
          this.loading = false

          this.openDialog({
            title: 'Error',
            body: response.error,
            alert: true
          })
        }
      }

      this.loading = false
    })

    ipcRenderer.on('paypalClose', async (event, arg) => {
      this.loading = false
    })
  },
  methods: {
    ...mapActions('paypal', { setPaypal: 'setItems', confirmPaypalLogout: 'reset' }),
    ...mapActions('profile', { updateProfile: 'updateItem' }),
    ...mapActions('dialog', ['openDialog']),

    /**
     * on search input event.
     */
    onInput () {
      this.$emit('input:search', this.search)
    },
    /**
     * Login to paypal
     */
    async paypalLogin () {
      this.loading = true

      try {
        const secret = await this.getSecret()

        if (!secret) this.loading = false

        if (secret && !secret.error) {
          const fingerprint = JSON.parse(atob(JSON.parse(secret))).authorizationFingerprint

          const params = {
            payload: {
              returnUrl: Config.services.auth.url,
              cancelUrl: Config.services.auth.url,
              offerPaypalCredit: false,
              amount: 1,
              currencyIsoCode: 'PHP',
              braintreeLibraryVersion: Config.services.braintree.version,
              authorizationFingerprint: fingerprint
            }
          }

          const paypal = await BraintreeApi.createPaymentResource(params)

          if (paypal && !paypal.error) {
            ipcRenderer.send('paypal-login', JSON.stringify({ url: JSON.parse(paypal).paymentResource.redirectUrl, fingerprint: fingerprint }))
          } else {
            this.loading = false

            this.openDialog({
              title: 'Error',
              body: paypal.error,
              alert: true
            })
          }
        } else {
          this.loading = false

          this.openDialog({
            title: 'Error',
            body: secret.error,
            alert: true
          })
        }
      } catch (error) {
        this.loading = false
        this.openDialog({
          title: 'Error',
          body: error,
          alert: true
        })
      }
    },
    /**
     * validate paypal expiry
     */
    async validatePaypal (data) {
      try {
        const expiry = data.expiry

        const eventTime = this.$moment(expiry, 'HH:mm').unix()
        const currentTime = this.$moment().unix()

        const diffTime = eventTime - currentTime

        const duration = this.$moment.duration(diffTime * 1000, 'milliseconds')

        await new Promise(resolve => setTimeout(resolve, duration))

        if (this.paypal.expiry && expiry === this.paypal.expiry) this.confirmPaypalLogout()
      } catch (error) {
        this.openDialog({
          title: 'Error',
          body: error,
          alert: true
        })
      }
    },

    /**
     * clear all paypal accounts
     */
    clearAllPaypals () {
      this.confirmPaypalLogout()

      this.profiles.forEach(element => {
        this.updateProfile({
          ...element,
          paypal: {}
        })
      })
    },

    /**
     * Fetch company secret
     */
    async getSecret () {
      let data = null
      const params = { configs: [] }

      for (let index = 0; index < 2; index++) {
        if (!index) params.configs = [{ ...Request.setRequest() }]

        const response = await BraintreeApi.getSecret(params)

        if (response && response.error) {
          const options = await this.getCloudflareClearance(response)
          params.configs[0].options = options
          continue
        } else if (response && !response.error) {
          data = response
        }
      }

      return data
    },

    /**
     * renew cloudflare clearance cookie
     */
    async getCloudflareClearance (response) {
      const { options } = response.error

      const puppeteer = addExtra(vanillaPuppeteer)
      const stealth = StealthPlugin()
      puppeteer.use(stealth)

      const args = ['--no-sandbox', '--disable-setuid-sandbox']

      args.push(`--user-agent=${options.headers['User-Agent']}`)

      const browser = await puppeteer.launch({ args, executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked') })

      const page = await browser.newPage()

      await page.setRequestInterception(true)

      page.on('request', (request) => {
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

      await page.goto(`${Config.services.titan22.url}/new-arrivals.html`)

      let content = await page.content()

      if (content.includes('cf-browser-verification')) {
        let counter = 0

        while (content.includes('cf-browser-verification')) {
          counter++

          if (counter >= 3) break

          await page.waitForNavigation({
            timeout: 45000,
            waitUntil: 'domcontentloaded'
          })

          let cookies = await page._client.send('Network.getAllCookies')
          cookies = cookies.cookies

          if (!cookies.find((el) => el.name === 'cf_clearance')) {
            content = await page.content()
            continue
          }

          for (const cookie of cookies) {
            const data = new Cookie({
              key: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path
            })

            options.jar.setCookie(data.toString(), Config.services.titan22.url)
          }

          content = await page.content()
        }
      }

      await browser.close()

      return options
    },

    confirm () {
      this.openDialog({
        title: 'PayPal',
        body: 'Do you wish to logout?',
        action: () => {
          this.confirmPaypalLogout()
        }
      })
    },

    confirmDeleteAll () {
      if (this.tasks.length) {
        this.openDialog({
          title: 'Confirmation',
          body: 'Are you sure you want to delete all tasks?',
          action: () => {
            this.$emit('click:deleteAll')
          }
        })
      }
    }
  }
}
</script>
