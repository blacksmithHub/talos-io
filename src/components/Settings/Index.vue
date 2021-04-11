<template>
  <v-form @submit.prevent="submit">
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-list dense>
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

          <v-col cols="6">
            <v-list dense>
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
                        required
                        clearable
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
        </v-row>
      </v-card-text>
    </v-card>

    <br>

    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-list dense>
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

import Bot from '@/services/task'
import Constant from '@/config/constant'

export default {
  data () {
    return {
      nightMode: false,
      withSound: false,
      monitorInterval: 10000,
      monitorProxy: {},
      webhookUrl: null,
      webhookTesting: false,
      saving: false
    }
  },
  computed: {
    ...mapState('core', ['tab']),
    ...mapState('settings', { settings: 'items' }),

    /**
     * Error messages for monitorInterval.
     *
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
     *
     */
    webhookErrors () {
      const errors = []

      if (!this.$v.webhookUrl.$dirty) return errors

      this.$v.webhookUrl.url || errors.push('Accepts only URL')

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
  },
  methods: {
    ...mapActions('snackbar', ['showSnackbar']),
    ...mapActions('settings', { setSettings: 'setItems' }),

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

        this.showSnackbar({ message: 'Settings successfully saved' })
      }
    },

    /**
     * Trigger test webhook event.
     *
     */
    testWebhook () {
      this.$v.$touch()

      if (!this.$v.$invalid && this.webhookUrl) {
        const options = {
          url: this.webhookUrl,
          productName: 'Test Webhook',
          productSku: '---'
        }

        Bot.sendWebhook(options)
      }
    }
  },
  validations: {
    webhookUrl: { url },
    monitorInterval: { minValue: minValue(1000), required }
  }
}
</script>
