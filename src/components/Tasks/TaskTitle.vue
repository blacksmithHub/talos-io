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
          class="mr-3"
          :class="(paypal && Object.keys(paypal).length) ? 'primary' : 'secondary'"
          depressed
          @click="(paypal && Object.keys(paypal).length) ? dialog=true : paypalLogin()"
        >
          <vue-fontawesome
            icon="paypal"
            size="1"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            class="ml-2"
            v-text="'PayPal Login'"
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
        <v-card-title class="headline">
          PayPal

          <v-spacer />

          <v-btn
            icon
            @click="dialog=false"
          >
            <v-icon v-text="'mdi-close'" />
          </v-btn>
        </v-card-title>

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
              @click="confirmPaypalLogout, dialog=false"
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
      dialog: false
    }
  },
  computed: {
    ...mapState('paypal', { paypal: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  created () {
    ipcRenderer.on('paypalParams', async (event, arg) => {
      if (!arg.profile) {
        const params = {
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

        const response = await BraintreeApi.getPaypalAccount(params)

        const data = response.data

        data.expiry = this.$moment().add(90, 'minutes').format('HH:mm:ss')

        this.setPaypal(data)
      }
    })

    this.validatePaypal()
  },
  methods: {
    ...mapActions('paypal', { setPaypal: 'setItems', confirmPaypalLogout: 'reset' }),
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
      const secret = await BraintreeApi.getSecret()

      const fingerprint = JSON.parse(atob(secret.data)).authorizationFingerprint

      const params = {
        returnUrl: Config.services.auth.url,
        cancelUrl: Config.services.auth.url,
        offerPaypalCredit: false,
        amount: 1,
        currencyIsoCode: 'PHP',
        braintreeLibraryVersion: Config.services.braintree.version,
        authorizationFingerprint: fingerprint
      }

      const paypal = await BraintreeApi.createPaymentResource(params)

      ipcRenderer.send('paypal-login', JSON.stringify({ url: paypal.data.paymentResource.redirectUrl, fingerprint: fingerprint, settings: this.settings }))
    },
    /**
     * validate paypal expiry
     */
    async validatePaypal () {
      const vm = this

      const loop = setTimeout(async () => {
        if (vm.paypal && Object.keys(vm.paypal).length) {
          const timer = vm.paypal.expiry
          const current = vm.$moment().format('HH:mm:ss')

          if (current >= timer) {
            vm.setPaypal({})
          }
        }

        clearTimeout(loop)
        vm.validatePaypal()
      }, 1000)
    }
  }
}
</script>
