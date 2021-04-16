<template>
  <v-app>
    <v-app-bar
      app
      dense
      class="titleBar transparent"
      flat
    >
      <v-row no-gutters>
        <v-col>
          <v-row
            no-gutters
            class="text-right"
            justify="center"
            align="center"
          >
            <v-col align-self="center">
              <v-btn
                icon
                x-small
                :ripple="false"
                class="mr-1"
                @click="onMinimize"
              >
                <v-icon
                  small
                  color="warning"
                  v-text="'mdi-checkbox-blank-circle'"
                />
              </v-btn>

              <v-btn
                icon
                x-small
                :ripple="false"
                @click="onClose"
              >
                <v-icon
                  small
                  color="error"
                  v-text="'mdi-checkbox-blank-circle'"
                />
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height text-center">
        <v-row
          no-gutters
          justify="center"
          align="center"
        >
          <v-col
            cols="8"
            align-self="center"
            class="text-center mb-5"
          >
            <v-row
              no-gutters
              justify="center"
              class="mb-3"
            >
              <v-col
                align-self="center"
                cols="4"
              >
                <v-img
                  :src="require('@/assets/talos.png')"
                  contain
                  width="100"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col
            cols="12"
            align-self="center"
            class="pl-5 pr-5"
          >
            <v-text-field
              v-model="key"
              outlined
              label="Key"
              dense
              :error-messages="(keyErrors.length) ? keyErrors : error"
              @blur="$v.key.$touch()"
            />

            <v-btn
              depressed
              outlined
              rounded
              color="primary"
              :loading="loading"
              @click="login"
            >
              Login
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { remote, ipcRenderer } from 'electron'

import AuthAPI from '@/api/auth'
import AuthService from '@/services/auth'

export default {
  data () {
    return {
      loading: false,
      user: {},
      key: '',
      error: ''
    }
  },
  computed: {
    keyErrors () {
      const errors = []

      if (!this.$v.key.$dirty) return errors

      this.$v.key.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    key () {
      this.error = ''
    }
  },
  methods: {
    login () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.loading = true

        AuthAPI.login({ key: this.key })
          .then(({ data }) => {
            this.loading = false

            if (data) {
              AuthService.setAuth({ key: this.key })
              this.$v.$reset()

              this.key = ''
              this.error = ''
              this.loading = false

              ipcRenderer.send('login')
            } else {
              this.error = 'Invalid key'
            }
          })
          .catch(() => {
            this.loading = false
            this.error = 'Invalid key'
          })
      }
    },

    onClose () {
      remote.getCurrentWindow().close()
    },
    onMaximize () {
      const win = remote.getCurrentWindow()

      if (!win.isMaximized()) {
        win.maximize()
      } else {
        win.unmaximize()
      }
    },
    onMinimize () {
      remote.getCurrentWindow().minimize()
    }
  },
  validations: {
    key: { required }
  }
}
</script>
