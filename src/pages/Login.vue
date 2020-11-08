<template>
  <v-app>
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
              :error-messages="keyErrors"
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
import electron, { ipcRenderer } from 'electron'
import path from 'path'
import AuthAPI from '@/api/auth'
import auth from '@/services/auth'

let win

export default {
  data () {
    return {
      loading: false,
      user: {},
      key: ''
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
  methods: {
    /**
     * Bind master key
     */
    async bind () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.loading = true

        const response = await AuthAPI.bind({
          discord_id: this.user.id,
          key: this.key
        })

        this.loading = false

        if (response.status === 200) {
          const data = {
            ...this.user,
            key: this.key
          }

          auth.setAuth(JSON.stringify(data))

          ipcRenderer.send('hide-login')
          ipcRenderer.send('toggle-home')
        }
      }
    },
    /**
     * Authenticate via discord oauth
     */
    async authenticate () {
      this.loading = true

      const { BrowserWindow } = electron.remote

      win = new BrowserWindow({
        width: 500,
        height: 800,
        minWidth: 500,
        minHeight: 800,
        parent: win,
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
          enableRemoteModule: true,
          webSecurity: false
        },
        icon: path.join(__static, 'icon.png')
      })

      win.removeMenu()

      const url = 'https://discord.com/api/oauth2/authorize?client_id=772830030967472158&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F&response_type=code&scope=identify%20email%20guilds'

      win.loadURL(url)

      win.openDevTools()

      win.on('closed', () => {
        win = null
      })

      const vm = this

      await this.getUserCode(win, async (response) => {
        win.close()

        if (response) {
          let credentials = {}

          while (!Object.keys(credentials).length) {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const DiscordOauth2 = require('discord-oauth2')
            const oauth = new DiscordOauth2()

            oauth.tokenRequest({
              clientId: '772830030967472158',
              clientSecret: 'c4lC0-QuUc3GfjdzPGgriVnAtJq04-_0',

              scope: 'identify guilds email',
              grantType: 'authorization_code',

              code: response.toString(),

              redirectUri: 'http://localhost:8080/'
            }).then((data) => {
              credentials = data
            })
          }

          while (!Object.keys(vm.user).length) {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const token = credentials.access_token

            const DiscordOauth2 = require('discord-oauth2')
            const oauth = new DiscordOauth2()

            oauth.getUser(token).then((data) => {
              vm.user = data
            })
          }

          this.loading = false
        }
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
    }
  },
  validations: {
    key: { required }
  }
}
</script>
