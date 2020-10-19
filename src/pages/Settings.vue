<template>
  <v-container class="mt-6">
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

                <v-list-item-subtitle v-text="'appearance'" />
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
                      style="width: 20vh"
                      clearable
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
                    color="primary"
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
                  outlined
                  type="number"
                  style="width: 15vh"
                  hide-details
                  :error-messages="monitorIntervalErrors"
                  @blur="$v.monitorInterval.$touch()"
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Backup all Tasks'" />

                <v-list-item-subtitle v-text="'All tasks will export in a .csv file'" />
              </v-list-item-content>

              <v-list-item-action>
                <download-csv
                  :data="backupTasks"
                  name="tasks.csv"
                >
                  <v-btn
                    class="primary"
                    rounded
                    small
                    v-text="'Export'"
                  />
                </download-csv>
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Clear Local Storage'" />

                <v-list-item-subtitle v-text="'All saved records will be removed'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                  class="primary"
                  rounded
                  small
                  @click="clearLocalStorage"
                  v-text="'Clear'"
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
                  clearable
                  @blur="$v.webhook.$touch()"
                />
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                  class="primary"
                  rounded
                  small
                  @click="testWebhook"
                  v-text="'test'"
                />
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            class="primary"
            rounded
            small
            @click="onCancel"
            v-text="'cancel'"
          />

          <v-btn
            class="primary"
            rounded
            type="submit"
            small
            v-text="'save'"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
import { url, minValue } from 'vuelidate/lib/validators'
import { mapState, mapActions } from 'vuex'
import { remote, ipcRenderer } from 'electron'
import webhook from '@/mixins/webhook'
import Config from '@/config/app'

export default {
  mixins: [webhook],
  data () {
    return {
      placeOrder: '',
      placeOrderMenu: false,
      monitorInterval: 1,
      webhook: '',
      nightMode: false,
      sound: false,
      autoPay: false,
      backupTasks: []
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' }),
    ...mapState('task', { tasks: 'items' }),

    /**
     * Error messages for webhook.
     *
     */
    webhookErrors () {
      const errors = []

      if (!this.$v.webhook.$dirty) return errors

      this.$v.webhook.url || errors.push('Accepts only URL')

      return errors
    },

    /**
     * Error messages for monitorInterval.
     *
     */
    monitorIntervalErrors () {
      const errors = []

      if (!this.$v.monitorInterval.$dirty) return errors

      this.$v.monitorInterval.minValue || errors.push('Invalid input')

      return errors
    }
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    }
  },
  created () {
    this.exportTasks(this.tasks)

    ipcRenderer.on('updateTasks', (event, arg) => {
      this.exportTasks(arg)
    })

    this.prepareDetails()
  },
  methods: {
    ...mapActions('setting', { updateSettings: 'setItems' }),

    /**
     * Clear all local storage.
     *
     */
    clearLocalStorage () {
      localStorage.removeItem('attributes')
      localStorage.removeItem('settings')
      localStorage.removeItem('tasks')

      ipcRenderer.send('clear-localStorage')
    },

    /**
     * Prepare jsons for exporting.
     *
     */
    exportTasks (tasks) {
      const jsons = []

      if (tasks.length) {
        tasks.forEach(element => {
          const sizes = element.sizes.slice().map((val) => val.label).join('+')

          jsons.push({
            name: element.name,
            email: element.email,
            password: element.password,
            sku: element.sku,
            sizes: sizes,
            bank: element.bank.name,
            cardHolder: element.bank.cardHolder,
            cardNumber: element.bank.cardNumber,
            expiry: element.bank.expiry,
            cvv: element.bank.cvv
          })
        })
      } else {
        jsons.push({
          name: '',
          email: '',
          password: '',
          sku: '',
          sizes: '',
          bank: '',
          cardHolder: '',
          cardNumber: '',
          expiry: '',
          cvv: ''
        })
      }

      this.backupTasks = jsons
    },

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
     * Trigger test webhook event.
     *
     */
    testWebhook () {
      this.$v.$touch()

      if (!this.$v.$invalid && this.webhook) {
        this.sendWebhook(this.webhook, 'Air Jordan 4 Off-White Sail', '9', Config.bot.name, '1')
      }
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

        ipcRenderer.send('update-settings', this.settings)
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
    webhook: { url },
    monitorInterval: { minValue: minValue(0) }
  }
}
</script>
