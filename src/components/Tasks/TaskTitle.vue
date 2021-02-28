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
          @click="(paypal && Object.keys(paypal).length) ? dialog=true : paypalLogin()"
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
          @click="$emit('click:deleteAll')"
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

    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title
          class="headline primary--text"
          style="border-bottom:1px solid #d85820"
        >
          PayPal

          <v-spacer />

          <v-btn
            icon
            class="primary--text"
            @click="dialog=false"
          >
            <v-icon v-text="'mdi-close'" />
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="text-center pa-5">
          <v-row
            justify="center"
            align="center"
            no-gutters
            class="fill-height"
          >
            <v-col
              align-self="center"
              cols="9"
            >
              Do you wish to logout?
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-container class="text-right">
            <v-btn
              class="primary mr-2"
              rounded
              depressed
              small
              @click="dialog=false"
            >
              Close
            </v-btn>

            <v-btn
              depressed
              small
              class="primary"
              rounded
              @click="confirmPaypalLogout(), dialog=false"
            >
              Logout
            </v-btn>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card-title>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import BraintreeApi from '@/api/magento/titan22/braintree'
import Config from '@/config/app'

export default {
  data () {
    return {
      search: '',
      dialog: false,
      loading: false
    }
  },
  computed: {
    ...mapState('paypal', { paypal: 'items' }),
    ...mapState('setting', { settings: 'items' }),
    ...mapState('profile', { profiles: 'items' })
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
          const data = response

          data.expiry = this.$moment().add(90, 'minutes').format('HH:mm:ss')

          this.setPaypal(data)
          this.validatePaypal(data)

          this.loading = false
        } else {
          this.loading = false
          this.setDialogComponent({ header: 'Error', content: response.error })
          this.setDialog(true)
        }
      }

      this.loading = false
    })

    ipcRenderer.on('paypalError', async (event, arg) => {
      this.setDialogComponent({ header: 'Error', content: 'Cannot launch Google Chrome' })
      this.setDialog(true)
    })

    ipcRenderer.on('paypalClose', async (event, arg) => {
      this.loading = false
    })
  },
  methods: {
    ...mapActions('paypal', { setPaypal: 'setItems', confirmPaypalLogout: 'reset' }),
    ...mapActions('profile', { updateProfile: 'updateItem' }),
    ...mapActions('core', ['setDialogComponent', 'setDialog']),

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
        const secret = await BraintreeApi.getSecret()

        if (secret && !secret.error) {
          const fingerprint = JSON.parse(atob(secret)).authorizationFingerprint

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
            ipcRenderer.send('paypal-login', JSON.stringify({ url: paypal.paymentResource.redirectUrl, fingerprint: fingerprint, settings: this.settings }))
          } else {
            this.loading = false
            this.setDialogComponent({ header: 'Error', content: paypal.error })
            this.setDialog(true)
          }
        } else {
          this.loading = false
          this.setDialogComponent({ header: 'Error', content: secret.error })
          this.setDialog(true)
        }
      } catch (error) {
        this.loading = false
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
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
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
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
    }
  }
}
</script>
