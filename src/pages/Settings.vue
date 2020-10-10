<template>
  <v-container class="mt-8">
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-text>
          <v-list
            class="pa-0"
            two-line
          >
            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Night Mode'" />

                <v-list-item-subtitle v-text="'Restart application to take effect'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-switch
                  v-model="nightMode"
                  inset
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Sound on Success'" />

                <v-list-item-subtitle v-text="'Receive sound alert each success notification'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-switch
                  v-model="sound"
                  inset
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Auto Pay'" />

                <v-list-item-subtitle v-text="'Enable this will automate payment process'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-switch
                  v-model="autoPay"
                  inset
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Place Order At'" />

                <v-list-item-subtitle v-text="'Set specific time before placing of order'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-menu
                  ref="placeOrderMenu"
                  v-model="placeOrderMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="placeOrder"
                  transition="scale-transition"
                  offset-y
                  max-width="350px"
                  min-width="350px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="placeOrder"
                      dense
                      hide-details
                      outlined
                      readonly
                      v-bind="attrs"
                      style="width: 15vh"
                      v-on="on"
                    />
                  </template>
                  <v-time-picker
                    v-if="placeOrderMenu"
                    v-model="placeOrder"
                    full-width
                    ampm-in-title
                    format="ampm"
                    use-seconds
                    @click:second="$refs.placeOrderMenu.save(placeOrder)"
                  />
                </v-menu>
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Monitor Refresh Interval'" />

                <v-list-item-subtitle v-text="'Set monitor refresh interval in second/s'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-text-field
                  v-model="monitorInterval"
                  dense
                  hide-details
                  outlined
                  type="number"
                  style="width: 15vh"
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Discord Webhook'" />

                <v-list-item-subtitle v-text="'Set custom discord webhook'" />
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-text-field
                  v-model="webhook"
                  dense
                  hide-details="auto"
                  outlined
                  :error-messages="webhookErrors"
                  @blur="$v.webhook.$touch()"
                />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            class="primary"
            rounded
            @click="onCancel"
            v-text="'cancel'"
          />

          <v-btn
            class="primary"
            rounded
            type="submit"
            v-text="'save'"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
import { url } from 'vuelidate/lib/validators'
import { mapState, mapActions } from 'vuex'
import { remote } from 'electron'

export default {
  data () {
    return {
      placeOrder: '',
      placeOrderMenu: false,
      monitorInterval: 1,
      webhook: '',
      nightMode: false,
      sound: false,
      autoPay: false
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' }),

    /**
     * Error messages for webhook.
     *
     */
    webhookErrors () {
      const errors = []

      if (!this.$v.webhook.$dirty) return errors

      this.$v.webhook.url || errors.push('Accepts only URL')

      return errors
    }
  },
  created () {
    this.prepareDetails()
  },
  methods: {
    ...mapActions('setting', { updateSettings: 'setItems' }),

    /**
     * Set all saved settings.
     *
     */
    prepareDetails () {
      this.placeOrder = this.settings.placeOrder
      this.monitorInterval = this.settings.monitorInterval
      this.webhook = this.settings.webhook
      this.nightMode = this.settings.nightMode
      this.sound = this.settings.sound
      this.autoPay = this.settings.autoPay
    },
    /**
     * On submit event.
     *
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.updateSettings({
          placeOrder: this.placeOrder,
          monitorInterval: this.monitorInterval,
          webhook: this.webhook,
          nightMode: this.nightMode,
          sound: this.sound,
          autoPay: this.autoPay
        })

        remote.getCurrentWindow().close()
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.prepareDetails()

      remote.getCurrentWindow().close()
    }
  },
  validations: {
    webhook: { url }
  }
}
</script>
