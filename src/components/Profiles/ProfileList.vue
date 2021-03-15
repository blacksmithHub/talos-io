<template>
  <div>
    <v-card>
      <v-card-title style="border-bottom: 1px solid #d85820">
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
                @click="addNewProfile"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-plus'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'add profile'"
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
                @click="importProfiles"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-upload'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'import profiles'"
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
                @click="confirmDeleteAll"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-delete'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'delete all profiles'"
                />
              </v-btn>
            </v-col>
          </v-row>
        </v-toolbar>
      </v-card-title>

      <v-divider />

      <v-card-text style="max-height: 65vh; overflow: auto">
        <v-list
          v-if="profiles.length"
          class="pa-0"
          three-line
          dense
        >
          <template v-for="(profile, index) in profiles">
            <v-list-item
              :key="`${index}-item`"
              class="pa-0"
            >
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
                          v-text="profile.name"
                        />
                      </v-col>

                      <v-col
                        cols="12"
                        md="3"
                        align-self="center"
                      >
                        <span
                          class="d-inline-block text-truncate"
                          style="max-width: 40vh"
                        >
                          <span
                            class="text-capitalize font-weight-bold"
                            v-text="'email:'"
                          />
                          {{ profile.email }}
                        </span>
                      </v-col>

                      <v-col
                        cols="12"
                        md="3"
                        align-self="center"
                      >
                        <span
                          class="d-inline-block text-truncate"
                          style="max-width: 40vh"
                        >
                          <span
                            class="text-capitalize font-weight-bold"
                            v-text="'password:'"
                          />
                          <input
                            :value="profile.password"
                            class="ml-1 grey--text"
                            readonly
                            disabled
                            type="password"
                          >
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col
                    align-self="center"
                    class="text-right"
                    cols="6"
                  >
                    <v-btn
                      icon
                      :color="(profile.paypal && Object.keys(profile.paypal).length) ? 'paypalLogin' : 'paypalLogout'"
                      depressed
                      class="mr-2"
                      :loading="profile.loading"
                      @click="(profile.paypal && Object.keys(profile.paypal).length) ? paypalLogout(profile) : paypalLogin(profile)"
                    >
                      <vue-fontawesome
                        icon="paypal"
                        size="1"
                      />
                    </v-btn>

                    <v-btn
                      icon
                      color="primary"
                      depressed
                      class="mr-2"
                      @click="editProfile(profile)"
                    >
                      <v-icon
                        small
                        v-text="'mdi-pencil'"
                      />
                    </v-btn>

                    <v-btn
                      icon
                      color="error"
                      depressed
                      @click="confirmDelete(index)"
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
              v-if="index < profiles.length - 1"
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

        <ProfileDialog ref="profileDialog" />
        <ImportProfileDialog ref="importProfileDialog" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-row no-gutters>
          <v-col cols="6">
            <small
              style="max-width: 100%"
              class="text-capitalize text-truncate d-inline-block"
              v-text="`total: ${profiles.length}`"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import ProfileDialog from '@/components/Profiles/ProfileDialog'
import ImportProfileDialog from '@/components/Profiles/ImportProfileDialog'
import BraintreeApi from '@/api/magento/titan22/braintree'
import Config from '@/config/app'
import vanillaPuppeteer from 'puppeteer'
import { addExtra } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Cookie } from 'tough-cookie'
import Request from '@/services/request'

const blockedResources = ['queue-it']

export default {
  components: {
    ProfileDialog,
    ImportProfileDialog
  },
  data () {
    return {
      selected: {}
    }
  },
  computed: {
    ...mapState('profile', { profiles: 'items' })
  },
  created () {
    this.validateAllPaypal()

    ipcRenderer.on('paypalParams', async (event, arg) => {
      if (arg.profile) {
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

          data.expiry = this.$moment().add(60, 'minutes').format('HH:mm:ss')

          const profile = {
            ...arg.profile,
            loading: false,
            paypal: data
          }

          this.updateProfile(profile)
          this.validatePaypal(profile)
        } else {
          arg.profile.loading = false
          this.updateProfile(arg.profile)

          this.openDialog({
            title: 'Error',
            body: response.error,
            alert: true
          })
        }
      }
    })

    ipcRenderer.on('paypalClose', async (event, arg) => {
      arg.loading = false
      this.updateProfile(arg)
    })
  },
  methods: {
    ...mapActions('profile', { setProfiles: 'setItems', updateProfile: 'updateItem', deleteProfile: 'deleteItem', reset: 'reset' }),
    ...mapActions('dialog', ['openDialog']),

    /**
     * Trigger add new profile dialog event.
     */
    addNewProfile () {
      this.$refs.profileDialog.dialog = true
    },
    /**
     * Trigger edit profile dialog event.
     */
    editProfile (profile) {
      this.$refs.profileDialog.mapData(profile)
    },
    /**
     * Trigger import profiles dialog event.
     */
    importProfiles () {
      this.$refs.importProfileDialog.dialog = true
    },
    /**
     * Login to paypal
     */
    async paypalLogin (profile) {
      profile.loading = true
      this.updateProfile(profile)

      try {
        const secret = await this.getSecret()

        if (!secret) profile.loading = false

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
            ipcRenderer.send('paypal-login', JSON.stringify({ url: JSON.parse(paypal).paymentResource.redirectUrl, fingerprint: fingerprint, profile: profile }))
          } else {
            profile.loading = false
            this.updateProfile(profile)

            this.openDialog({
              title: 'Error',
              body: paypal.error,
              alert: true
            })
          }
        } else {
          profile.loading = false
          this.updateProfile(profile)

          this.openDialog({
            title: 'Error',
            body: secret.error,
            alert: true
          })
        }
      } catch (error) {
        profile.loading = false
        this.updateProfile(profile)

        this.openDialog({
          title: 'Error',
          body: error,
          alert: true
        })
      }
    },
    /**
     * Logout to paypal
     */
    paypalLogout (profile) {
      this.selected = profile
      this.openDialog({
        title: 'PayPal',
        body: 'Do you wish to logout?',
        action: () => {
          this.updateProfile({
            ...this.selected,
            paypal: {}
          })
        }
      })
    },

    /**
     * perform paypal validation
     */
    async validatePaypal (profile) {
      try {
        const expiry = profile.paypal.expiry

        const eventTime = this.$moment(expiry, 'HH:mm').unix()
        const currentTime = this.$moment().unix()

        const diffTime = eventTime - currentTime

        const duration = this.$moment.duration(diffTime * 1000, 'milliseconds')

        await new Promise(resolve => setTimeout(resolve, duration))

        const currentProfile = this.profiles.find((el) => el.id === profile.id)

        if (currentProfile &&
      currentProfile.paypal &&
      Object.keys(currentProfile.paypal).length &&
      expiry === currentProfile.paypal.expiry) {
          this.updateProfile({
            ...currentProfile,
            paypal: {}
          })
        }
      } catch (error) {
        this.openDialog({
          title: 'Error',
          body: error,
          alert: true
        })
      }
    },

    /**
     * validate all profiles
     */
    validateAllPaypal () {
      this.profiles.forEach(element => {
        this.updateProfile({
          ...element,
          loading: false
        })

        if (element.paypal && Object.keys(element.paypal).length) this.validatePaypal(element)
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

    confirmDelete (index) {
      this.openDialog({
        title: 'Confirmation',
        body: 'Are you sure you want to delete this profile?',
        action: () => {
          this.deleteProfile(index)
        }
      })
    },

    confirmDeleteAll () {
      if (this.profiles.length) {
        this.openDialog({
          title: 'Confirmation',
          body: 'Are you sure you want to delete all profiles?',
          action: () => {
            this.reset()
          }
        })
      }
    }
  }
}
</script>
