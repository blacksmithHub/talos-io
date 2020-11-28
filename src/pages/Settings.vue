<template>
  <v-container>
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-text style="max-height: 80vh; overflow: auto">
          <v-list
            class="pa-0"
            two-line
            dense
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
                <v-list-item-title v-text="'Auto Fill + Auto Pay'" />

                <v-list-item-subtitle v-text="'Enable this to submit payment automatically upon success'" />
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
                <v-list-item-title v-text="'Auto Fill'" />

                <v-list-item-subtitle v-text="'Enable this to fill up bank details automatically upon success'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-switch
                  v-model="autoFill"
                  inset
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Manual Checkout'" />

                <v-list-item-subtitle v-text="'Launch checkout page manually upon success'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-switch
                  v-model="manual"
                  inset
                />
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="pa-0">
              <v-list-item-content class="pa-2">
                <v-list-item-title v-text="'Monitor Refresh Interval'" />

                <v-list-item-subtitle v-text="'Set monitor refresh interval in milliseconds'" />
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
                <v-list-item-title v-text="'Backup all Profiles'" />

                <v-list-item-subtitle v-text="'All profiles will export in a .csv file'" />
              </v-list-item-content>

              <v-list-item-action>
                <download-csv
                  :data="backupProfiles"
                  name="profiles.csv"
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
                <v-list-item-title v-text="'Backup all Banks'" />

                <v-list-item-subtitle v-text="'All banks will export in a .csv file'" />
              </v-list-item-content>

              <v-list-item-action>
                <download-csv
                  :data="backupBanks"
                  name="banks.csv"
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
                  @click="dialog = true"
                  v-text="'Clear'"
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

    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Confirmation
        </v-card-title>

        <v-card-text>
          Do you wish to clear all saved records?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            class="primary"
            rounded
            small
            @click="dialog = false"
          >
            Disagree
          </v-btn>

          <v-btn
            small
            class="primary"
            rounded
            @click="clearLocalStorage"
          >
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { url, minValue } from 'vuelidate/lib/validators'
import { mapState, mapActions } from 'vuex'
import { remote, ipcRenderer } from 'electron'
import webhook from '@/mixins/webhook'

export default {
  mixins: [webhook],
  data () {
    return {
      dialog: false,
      monitorInterval: 1,
      webhook: '',
      nightMode: false,
      sound: false,
      autoPay: false,
      autoFill: false,
      manual: false,
      backupTasks: [],
      backupProfiles: [],
      backupBanks: []
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' }),
    ...mapState('task', { tasks: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('bank', { banks: 'items' }),

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
    banks () {
      this.exportBanks(this.banks)
    },
    profiles () {
      this.exportProfiles(this.profiles)
    },
    tasks () {
      this.exportTasks(this.tasks)
    },
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    manual () {
      if (this.manual) this.autoPay = false
    },
    autoPay () {
      if (this.autoPay) {
        this.manual = false
        this.autoFill = false
      }
    },
    autoFill () {
      if (this.autoFill) this.autoPay = false
    }
  },
  created () {
    this.exportTasks(this.tasks)
    this.exportProfiles(this.profiles)
    this.exportBanks(this.banks)

    ipcRenderer.on('updateTasks', (event, arg) => {
      this.exportTasks(arg)
    })

    ipcRenderer.on('updateProfiles', (event, arg) => {
      this.exportProfiles(arg)
    })

    ipcRenderer.on('updateBanks', (event, arg) => {
      this.exportBanks(arg)
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
      localStorage.removeItem('profiles')
      localStorage.removeItem('banks')

      try {
        ipcRenderer.send('clear-localStorage')
      } catch (error) {
        //
      }

      this.dialog = false
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
            email: element.profile.email,
            password: element.profile.password,
            sku: element.sku,
            sizes: sizes,
            bank: element.bank.bank.name,
            cardHolder: element.bank.cardHolder,
            cardNumber: element.bank.cardNumber,
            expiryMonth: element.bank.expiryMonth,
            expiryYear: element.bank.expiryYear,
            cvv: element.bank.cvv,
            delay: element.delay,
            placeOrder: element.placeOrder
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
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          delay: 1000
        })
      }

      this.backupTasks = jsons
    },

    /**
     * Prepare jsons for exporting.
     *
     */
    exportProfiles (profiles) {
      const jsons = []

      if (profiles.length) {
        profiles.forEach(element => {
          jsons.push({
            name: element.name,
            email: element.email,
            password: element.password
          })
        })
      } else {
        jsons.push({
          name: '',
          email: '',
          password: ''
        })
      }

      this.backupProfiles = jsons
    },

    /**
     * Prepare jsons for exporting.
     *
     */
    exportBanks (banks) {
      const jsons = []

      if (banks.length) {
        banks.forEach(element => {
          jsons.push({
            nickname: element.nickname,
            bank: element.bank.name,
            cardHolder: element.cardHolder,
            cardNumber: element.cardNumber,
            expiryMonth: element.expiryMonth,
            expiryYear: element.expiryYear,
            cvv: element.cvv
          })
        })
      } else {
        jsons.push({
          nickname: '',
          bank: '',
          cardHolder: '',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: ''
        })
      }

      this.backupBanks = jsons
    },

    /**
     * Set all saved settings.
     *
     */
    prepareDetails () {
      this.dialog = false
      this.monitorInterval = this.settings.monitorInterval
      this.webhook = this.settings.webhook
      this.nightMode = this.settings.nightMode
      this.sound = this.settings.sound
      this.autoPay = this.settings.autoPay
      this.autoFill = this.settings.autoFill
      this.manual = this.settings.manual
    },

    /**
     * Trigger test webhook event.
     *
     */
    testWebhook () {
      this.$v.$touch()

      if (!this.$v.$invalid && this.webhook) {
        this.sendWebhook(this.webhook, 'Air Jordan 4 Retro Off-White Sail', '9', null, null, 'CV9388-100')
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
          monitorInterval: this.monitorInterval,
          webhook: this.webhook,
          nightMode: this.nightMode,
          sound: this.sound,
          autoPay: this.autoPay,
          autoFill: this.autoFill,
          manual: this.manual
        })

        try {
          ipcRenderer.send('update-settings', this.settings)
        } catch (error) {
          //
        }

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
