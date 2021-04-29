<template>
  <v-form @submit.prevent="submit">
    <v-card
      flat
      class="transparent"
    >
      <v-card-text class="pa-0">
        <v-row
          class="mb-3"
          justify="center"
          align="center"
          no-gutters
        >
          <v-col cols="6">
            <v-card
              class="transparent pa-0"
              flat
            >
              <v-card-text class="pa-0">
                <span class="cursor">Version: {{ about.version }}</span>

                <v-btn
                  x-small
                  class="ml-3"
                  depressed
                  :loading="loading"
                  @click="checkUpdate"
                >
                  <v-icon
                    left
                    small
                    v-text="'mdi-reload'"
                  />
                  check for updates
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col
            cols="6"
            class="text-right"
          >
            <v-btn
              x-small
              depressed
              @click="resetAll"
            >
              <v-icon
                left
                x-small
                v-text="'mdi-rotate-left'"
              />
              reset all data
            </v-btn>
          </v-col>
        </v-row>

        <v-card>
          <v-card-text>
            <v-row>
              <v-col
                cols="6"
                class="pt-0 pl-0 pb-0"
              >
                <v-list
                  dense
                  class="pa-0 cursor"
                >
                  <v-subheader v-text="'Preferences'" />
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

                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-2">
                      <v-list-item-title v-text="'Sound on Success'" />
                      <v-list-item-subtitle v-text="'Receive sound alert each success notification'" />
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-switch
                        v-model="withSound"
                        inset
                      />
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-divider vertical />

              <v-col
                cols="6"
                class="pt-0 pr-0 pb-0"
              >
                <v-list
                  dense
                  class="pa-0 cursor"
                >
                  <v-subheader v-text="'Monitor'" />
                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-2">
                      <v-row>
                        <v-col>
                          <v-list-item-title v-text="'Monitor Refresh Interval'" />
                          <v-list-item-subtitle v-text="'Set monitor refresh interval in milliseconds'" />
                        </v-col>

                        <v-col>
                          <v-text-field
                            v-model="monitorInterval"
                            dense
                            outlined
                            type="number"
                            hide-details="auto"
                            placeholder="ms"
                            :error-messages="monitorIntervalErrors"
                            @blur="$v.monitorInterval.$touch()"
                          />
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-2">
                      <v-row>
                        <v-col>
                          <v-list-item-title v-text="'Monitor Proxy List'" />
                          <v-list-item-subtitle v-text="'Assign proxy list'" />
                        </v-col>

                        <v-col>
                          <v-autocomplete
                            v-model="monitorProxy"
                            :items="proxies"
                            required
                            outlined
                            dense
                            item-text="name"
                            return-object
                            hide-details
                            placeholder="select proxy list"
                          />
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col
                cols="6"
                class="pt-0 pl-0 pb-0"
              >
                <v-list
                  dense
                  class="pa-0 cursor"
                >
                  <v-subheader v-text="'Cloudflare Bypasser'" />
                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-2">
                      <v-row>
                        <v-col>
                          <v-list-item-title>
                            <span v-text="'Total Challenge Window'" />

                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                  v-bind="attrs"
                                  small
                                  class="mb-1 ml-2"
                                  v-on="on"
                                  v-text="'mdi-information'"
                                />
                              </template>
                              <span v-text="'Only applies to tasks'" />
                            </v-tooltip>
                          </v-list-item-title>
                          <v-list-item-subtitle v-text="'Set total count of challenge windows at a time'" />
                        </v-col>

                        <v-col>
                          <v-text-field
                            v-model="doors"
                            dense
                            outlined
                            type="number"
                            hide-details="auto"
                            hint="Zero means infinite"
                            :error-messages="doorsErrors"
                            @blur="$v.doors.$touch()"
                          />
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-divider vertical />

              <v-col
                cols="6"
                class="pt-0 pr-0 pb-0"
              >
                <v-list
                  dense
                  class="pa-0 cursor"
                >
                  <v-subheader v-text="'Restore CSV Backup Files'" />
                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-2">
                      <v-row
                        justify="center"
                        align="center"
                        class="text-center"
                      >
                        <v-col>
                          <v-btn
                            class="primary"
                            depressed
                            rounded
                            small
                            @click="importTasks"
                          >
                            <v-icon
                              small
                              left
                              v-text="'mdi-download'"
                            />
                            tasks
                          </v-btn>
                        </v-col>

                        <v-col>
                          <v-btn
                            class="primary"
                            depressed
                            rounded
                            small
                            @click="importProfiles"
                          >
                            <v-icon
                              small
                              left
                              v-text="'mdi-download'"
                            />
                            profiles
                          </v-btn>
                        </v-col>

                        <v-col>
                          <v-btn
                            class="primary"
                            depressed
                            rounded
                            small
                            @click="importBanks"
                          >
                            <v-icon
                              small
                              left
                              v-text="'mdi-download'"
                            />
                            banks
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <br>

        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-list
                  dense
                  class="cursor"
                >
                  <v-subheader v-text="'Webhook'" />
                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-2">
                      <v-row>
                        <v-col cols="3">
                          <v-list-item-title v-text="'Discord Webhook'" />
                          <v-list-item-subtitle v-text="'Set custom discord webhook'" />
                        </v-col>

                        <v-col>
                          <v-text-field
                            v-model="webhookUrl"
                            dense
                            hide-details="auto"
                            outlined
                            clearable
                            placeholder="webhook url"
                            :error-messages="webhookUrlErrors"
                            @blur="$v.webhookUrl.$touch()"
                          />
                        </v-col>

                        <v-col
                          cols="2"
                          align-self="center"
                          class="text-center"
                        >
                          <v-btn
                            outlined
                            small
                            rounded
                            depressed
                            :loading="webhookTesting"
                            @click="testWebhook"
                          >
                            test webhook
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-center mt-3">
        <v-btn
          rounded
          depressed
          color="primary"
          outlined
          :loading="saving"
          type="submit"
        >
          <v-icon
            left
            v-text="'mdi-content-save'"
          />
          save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { required, url, minValue } from 'vuelidate/lib/validators'
import electron, { ipcRenderer } from 'electron'
import fs from 'fs'
import csv from 'csv-parser'

import Webhook from '@/services/webhook'
import Constant from '@/config/constant'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default {
  data () {
    return {
      nightMode: false,
      withSound: false,
      monitorInterval: 10000,
      monitorProxy: {},
      webhookUrl: null,
      webhookTesting: false,
      saving: false,
      doors: 1,
      loading: false
    }
  },
  computed: {
    ...mapState('core', ['tab', 'about']),
    ...mapState('settings', { settings: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
    ...mapState('cloudflare', { cloudflare: 'items' }),
    ...mapState('account', { accounts: 'items' }),
    ...mapState('billing', { billings: 'items' }),

    /**
     * Error messages for monitorInterval.
     */
    monitorIntervalErrors () {
      const errors = []

      if (!this.$v.monitorInterval.$dirty) return errors

      this.$v.monitorInterval.minValue || errors.push('Invalid input, 1000 min')
      this.$v.monitorInterval.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for webhook.
     */
    webhookUrlErrors () {
      const errors = []

      if (!this.$v.webhookUrl.$dirty) return errors

      this.$v.webhookUrl.url || errors.push('Accepts only URL')

      return errors
    },
    /**
     * Error messages for doors.
     */
    doorsErrors () {
      const errors = []

      if (!this.$v.doors.$dirty) return errors

      this.$v.doors.minValue || errors.push('Invalid input, 0 min')
      this.$v.doors.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    tab () {
      if (this.tab !== Constant.TABS.SETTINGS) this.reset()
    }
  },
  created () {
    this.reset()

    // no app update
    ipcRenderer.on('noUpdate', (event, arg) => {
      if (this.loading) {
        this.loading = false
        this.showSnackbar({ message: 'You are up to date!', color: 'teal' })
      }
    })

    // error app update
    ipcRenderer.on('errorUpdate', (event, arg) => {
      if (this.loading) {
        this.loading = false
        this.showSnackbar({ message: 'Failed to check for updates', color: 'error' })
      }
    })

    // done app update
    ipcRenderer.on('doneUpdate', (event, arg) => {
      this.loading = false
    })
  },
  methods: {
    ...mapActions('snackbar', ['showSnackbar']),
    ...mapActions('settings', { setSettings: 'setItems' }),
    ...mapActions('dialog', ['openDialog']),
    ...mapActions('cloudflare', ['addDoors', 'removeDoors']),
    ...mapActions('task', { addTask: 'addItem' }),
    ...mapActions('account', { addAccount: 'addItem' }),
    ...mapActions('billing', { addBilling: 'addItem' }),

    /**
     * Clear changes
     */
    reset () {
      this.nightMode = this.settings.nightMode
      this.withSound = this.settings.withSound
      this.monitorInterval = this.settings.monitorInterval
      this.monitorProxy = this.settings.monitorProxy
      this.webhookUrl = this.settings.webhookUrl
      this.webhookTesting = false
      this.saving = false
      this.doors = this.cloudflare.doors.length
    },

    /**
     * Save data
     */
    submit () {
      try {
        this.$v.$touch()

        if (!this.$v.$invalid) {
          this.setSettings({
            monitorInterval: this.monitorInterval,
            webhookUrl: this.webhookUrl,
            nightMode: this.nightMode,
            withSound: this.withSound,
            monitorProxy: { ...this.monitorProxy }
          })

          if (this.doors > this.cloudflare.doors.length) {
            const count = (this.doors - this.cloudflare.doors.length)
            for (let index = 0; index < count; index++) {
              this.addDoors(true)
            }
          } else if (this.doors < this.cloudflare.doors.length) {
            const count = (this.cloudflare.doors.length - this.doors)
            for (let index = 0; index < count; index++) {
              this.removeDoors()
            }
          }

          ipcRenderer.send('update-settings', JSON.stringify(this.settings))
          this.showSnackbar({ message: 'Saved successfully', color: 'teal' })
        }
      } catch (error) {
        console.log(this.monitorProxy)
        console.log(error)
      }
    },

    /**
     * Trigger test webhook event.
     */
    testWebhook () {
      this.$v.$touch()

      if (!this.$v.$invalid && this.webhookUrl) {
        const options = {
          url: this.webhookUrl,
          productName: 'Test Webhook',
          productSku: '---'
        }

        Webhook.sendWebhook(options)
      }
    },

    checkUpdate () {
      if (!isDevelopment) {
        this.loading = true
        ipcRenderer.send('check-update')
      }
    },

    resetAll () {
      this.openDialog({
        title: 'Reset All Data',
        body: 'Restart the application to apply the changes.',
        actionLabel: 'Restart',
        cancelLabel: 'Later',
        action: () => {
          localStorage.removeItem('settings')
          localStorage.removeItem('proxies')
          localStorage.removeItem('accounts')
          localStorage.removeItem('billings')
          localStorage.removeItem('tasks')
          localStorage.removeItem('cloudflare')

          setTimeout(ipcRenderer.send('relaunch'), 3000)
        }
      })
    },

    // Temp import profiles csv
    importProfiles () {
      const dialog = electron.remote.dialog

      dialog.showOpenDialog({
        title: 'Import Profiles',
        buttonLabel: 'Import',
        filters: [
          {
            name: 'CSV',
            extensions: ['csv']
          }
        ],
        properties: []
      })
        .then(async (result) => {
          if (!result.filePaths.length) return null

          fs.createReadStream(result.filePaths[0].toString(), 'utf8')
            .pipe(csv())
            .on('data', (row) => {
              this.addAccount({
                name: null,
                email: row.email,
                password: row.password,
                sameAs: false,
                paypal: {
                  email: null,
                  password: null
                },
                loading: false
              })
            })
            .on('end', () => {
              this.showSnackbar({ message: 'Imported successfully', color: 'teal' })
            })
        })
    },

    // Temp import banks csv
    importBanks () {
      const dialog = electron.remote.dialog

      dialog.showOpenDialog({
        title: 'Import Banks',
        buttonLabel: 'Import',
        filters: [
          {
            name: 'CSV',
            extensions: ['csv']
          }
        ],
        properties: []
      })
        .then(async (result) => {
          if (!result.filePaths.length) return null

          fs.createReadStream(result.filePaths[0].toString(), 'utf8')
            .pipe(csv())
            .on('data', (row) => {
              this.addBilling({
                name: null,
                bank: row.bank,
                cardHolder: row.cardHolder,
                cardNumber: row.cardNumber,
                expiryMonth: row.expiryMonth,
                expiryYear: row.expiryYear,
                cvv: row.cvv
              })
            })
            .on('end', () => {
              this.showSnackbar({ message: 'Imported successfully', color: 'teal' })
            })
        })
    },

    // Temp import tasks csv
    importTasks () {
      const dialog = electron.remote.dialog

      dialog.showOpenDialog({
        title: 'Import Tasks',
        buttonLabel: 'Import',
        filters: [
          {
            name: 'CSV',
            extensions: ['csv']
          }
        ],
        properties: []
      })
        .then(async (result) => {
          if (!result.filePaths.length) return null

          fs.createReadStream(result.filePaths[0].toString(), 'utf8')
            .pipe(csv())
            .on('data', (row) => {
              this.addBilling({
                name: null,
                bank: row.bank,
                cardHolder: row.cardHolder,
                cardNumber: row.cardNumber,
                expiryMonth: row.expiryMonth,
                expiryYear: row.expiryYear,
                cvv: row.cvv
              })

              this.addAccount({
                name: null,
                email: row.email,
                password: row.password,
                sameAs: false,
                paypal: {
                  email: null,
                  password: null
                },
                loading: false
              })

              const sizes = []

              row.sizes.split('+').forEach((element) => {
                const attr = Constant.TITAN_ATTRIBUTES.find((val) => val.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase()))

                const size = attr.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase())

                sizes.push({
                  attribute_id: attr.attribute_id,
                  value: size.value,
                  label: size.label
                })
              })

              this.addTask({
                sku: row.sku,
                account: { ...this.accounts[this.accounts.length - 1] },
                billing: { ...this.billings[this.billings.length - 1] },
                proxy: { ...this.proxies[0] },
                placeOrder: null,
                sizes: sizes,
                delay: 3500,
                qty: 1,
                mode: Constant.CLIENT[0],
                checkoutMethod: Constant.METHODS[3],
                autoPay: false,
                autoFill: true
              })
            })
            .on('end', () => {
              this.showSnackbar({ message: 'Imported successfully', color: 'teal' })
            })
        })
    }
  },
  validations: {
    webhookUrl: { url },
    monitorInterval: { minValue: minValue(1000), required },
    doors: { minValue: minValue(0), required }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
