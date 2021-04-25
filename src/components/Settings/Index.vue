<template>
  <v-form @submit.prevent="submit">
    <v-row
      class="mt-2"
      justify="center"
      align="center"
    >
      <v-col cols="12">
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
    </v-row>

    <br>

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

          <v-divider
            vertical
            class="my-4"
          />

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

    <br>

    <v-btn
      x-small
      class="ml-1"
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

    <v-row
      justify="center"
      align="center"
    >
      <v-col
        align-self="center"
        cols="2"
        class="text-center"
      >
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
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { required, url, minValue } from 'vuelidate/lib/validators'
import { ipcRenderer } from 'electron'

import Webhook from '@/services/webhook'
import Constant from '@/config/constant'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default {
  data () {
    return {
      nightMode: false,
      withSound: false,
      monitorInterval: 10000,
      monitorProxy: { id: null, name: 'Localhost' },
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

    // progress app update
    ipcRenderer.on('newUpdate', (event, arg) => {
      this.loading = true
    })

    // no app update
    ipcRenderer.on('noUpdate', (event, arg) => {
      this.loading = false
    })

    // error app update
    ipcRenderer.on('errorUpdate', (event, arg) => {
      this.loading = false
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

    /**
     * Clear changes
     */
    reset () {
      this.nightMode = this.settings.nightMode
      this.withSound = this.settings.withSound
      this.monitorInterval = this.settings.monitorInterval
      this.monitorProxy = (this.settings.monitorProxy.id) ? this.settings.monitorProxy : { id: null, name: 'Localhost' }
      this.webhookUrl = this.settings.webhookUrl
      this.webhookTesting = false
      this.saving = false
      this.doors = this.cloudflare.doors.length
    },

    /**
     * Save data
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.setSettings({
          monitorInterval: this.monitorInterval,
          webhookUrl: this.webhookUrl,
          nightMode: this.nightMode,
          withSound: this.withSound,
          monitorProxy: this.monitorProxy
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

        ipcRenderer.send('update-settings', this.settings)
        this.showSnackbar({ message: 'Saved successfully', color: 'teal' })
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
