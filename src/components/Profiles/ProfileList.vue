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
                @click="reset"
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
                      @click="deleteProfile(index)"
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
              @click="confirmPaypalLogout"
            >
              Logout
            </v-btn>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import ProfileDialog from '@/components/Profiles/ProfileDialog'
import ImportProfileDialog from '@/components/Profiles/ImportProfileDialog'
import BraintreeApi from '@/api/magento/titan22/braintree'
import Config from '@/config/app'

export default {
  components: {
    ProfileDialog,
    ImportProfileDialog
  },
  data () {
    return {
      dialog: false,
      selected: {}
    }
  },
  computed: {
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  created () {
    this.validateAllPaypal()

    ipcRenderer.on('paypalParams', async (event, arg) => {
      if (arg.profile) {
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

        const profile = {
          ...arg.profile,
          paypal: data
        }

        this.updateProfile(profile)
        this.validatePaypal(profile)
      }
    })
  },
  methods: {
    ...mapActions('profile', { setProfiles: 'setItems', updateProfile: 'updateItem', deleteProfile: 'deleteItem', reset: 'reset' }),
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

      ipcRenderer.send('paypal-login', JSON.stringify({ url: paypal.data.paymentResource.redirectUrl, fingerprint: fingerprint, settings: this.settings, profile: profile }))
    },
    /**
     * Logout to paypal
     */
    async paypalLogout (profile) {
      this.selected = profile
      this.dialog = true
    },
    /**
     * Confirm logout to paypal
     */
    async confirmPaypalLogout () {
      this.updateProfile({
        ...this.selected,
        paypal: {}
      })

      this.dialog = false
    },

    /**
     * perform paypal validation
     */
    async validatePaypal (profile) {
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
    },

    /**
     * validate all profiles
     */
    validateAllPaypal () {
      this.profiles.forEach(element => {
        if (element.paypal && Object.keys(element.paypal).length) this.validatePaypal(element)
      })
    }
  }
}
</script>
