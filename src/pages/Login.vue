<template>
  <v-app>
    <SystemBar :headers="false" />
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
            class="text-center"
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
                  :src="require('@/assets/icon.png')"
                  contain
                  width="100"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col
            v-if="!Object.keys(user).length"
            cols="12"
            align-self="center"
          >
            <v-btn
              :loading="loading"
              small
              rounded
              @click="authenticate"
            >
              login in with discord
            </v-btn>
          </v-col>

          <v-col
            v-else
            cols="12"
            align-self="center"
            class="pl-5 pr-5"
          >
            <v-text-field
              v-model="key"
              outlined
              label="Key"
              dense
              append-icon="mdi-key-variant"
              :loading="loading"
              :error-messages="(keyErrors.length) ? keyErrors : apiValidation"
              hide-details="auto"
              @click:append="bind"
              @blur="$v.key.$touch()"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
/* global __static */

import { required } from 'vuelidate/lib/validators'

import AuthAPI from '@/api/auth'
import auth from '@/services/auth'
import SystemBar from '@/components/App/SystemBar'
import electron, { remote, ipcRenderer } from 'electron'
import path from 'path'
import Config from '@/config/app'

let win

export default {
  components: { SystemBar },
  data () {
    return {
      loading: false,
      user: {},
      key: '',
      apiValidation: []
    }
  },
  computed: {
    /**
     * Error messages for key.
     *
     */
    keyErrors () {
      const errors = []

      if (!this.$v.key.$dirty) return errors

      this.$v.key.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    key () {
      this.apiValidation = []
    }
  },
  methods: {
    async authenticate () {
      this.loading = true

      const { BrowserWindow } = electron.remote

      win = new BrowserWindow({
        width: 600,
        height: 600,
        minWidth: 500,
        minHeight: 500,
        parent: remote.getCurrentWindow(),
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
          enableRemoteModule: true,
          webSecurity: false
        },
        icon: path.join(__static, 'icon.png')
      })

      win.removeMenu()

      win.loadURL(Config.services.discord.auth)

      win.on('closed', () => {
        win = null
      })

      const vm = this

      await this.getUserCode(win, async (response) => {
        win.close()

        if (response) {
          vm.user = {}

          while (!vm.user.credentials) {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const DiscordOauth2 = require('discord-oauth2')

            const oauth = new DiscordOauth2()

            oauth.tokenRequest({
              clientId: Config.services.discord.clientId,
              clientSecret: Config.services.discord.clientSecret,
              scope: 'identify',
              grantType: 'authorization_code',
              code: response.toString(),
              redirectUri: Config.services.local
            }).then((data) => {
              vm.user.credentials = data
            })
          }

          while (!vm.user.profile) {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const token = vm.user.credentials.access_token

            const DiscordOauth2 = require('discord-oauth2')

            const oauth = new DiscordOauth2()

            oauth.getUser(token).then((data) => {
              vm.user.profile = data
            })
          }
        }

        this.loading = false
      })
    },
    /**
     * Get user code via discord oauth
     */
    getUserCode (win, callback) {
      let code = ''

      const loop = setInterval(() => {
        if (win === null) {
          clearInterval(loop)
          callback(code)
        } else {
          const currentUrl = win.webContents.getURL()

          code = currentUrl.toString().split('?')[1].toString().split('code=')[1]

          const error = currentUrl.toString().split('?')[1].toString().split('error=')[1]

          if (code) {
            clearInterval(loop)
            callback(code)
          } else if (error) {
            clearInterval(loop)
            callback(code)
          }
        }
      }, 1000)
    },
    /**
     * Bind master key
     */
    async bind () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.loading = true

        await AuthAPI.bind({
          discord_id: this.user.profile.id,
          key: this.key
        })
          .then((response) => {
            switch (response.status) {
              case 200: {
                const data = {
                  ...this.user,
                  key: this.key
                }

                auth.setAuth(JSON.stringify(data))

                this.key = ''
                this.user = {}
                this.apiValidation = []

                this.$v.$reset()

                ipcRenderer.send('bind')

                break
              }

              case 422:
                this.apiValidation.push(response.data.errors.key[0])

                break
            }

            this.loading = false
          })
      }
    }
  },
  validations: {
    key: { required }
  }
}
</script>
