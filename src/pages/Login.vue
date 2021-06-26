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
            cols="7"
            align-self="center"
            class="pl-5 pr-5"
          >
            <v-alert
              v-if="error"
              dense
              border="left"
              type="error"
              text
              icon="mdi-alert-octagon"
            >
              {{ error }}
            </v-alert>

            <v-btn
              depressed
              outlined
              rounded
              :color="(success) ? 'success' : 'primary'"
              :loading="loading"
              class="text-capitalize"
              @click="login"
            >
              <v-icon
                left
                v-text="'mdi-discord'"
              />
              login with discord
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
/* global __static */

import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import electron, { remote, globalShortcut, ipcRenderer } from 'electron'
import path from 'path'
import URL from 'url-parse'

import AuthAPI from '@/api/auth'
import Config from '@/config/app'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default {
  data () {
    return {
      loading: false,
      error: '',
      success: false
    }
  },
  methods: {
    ...mapActions('snackbar', ['showSnackbar']),

    async login (discord = true) {
      this.error = ''
      this.loading = true

      const response = await AuthAPI.get()
        .then(({ data }) => data)
        .catch(({ response }) => response)

      if (response.status) {
        switch (response.status) {
          case 401:
            this.error = response.data.msg
            this.loading = false
            break

          default:
            if (discord) {
              const { BrowserWindow } = electron.remote

              let win = new BrowserWindow({
                width: 520,
                height: 850,
                minWidth: 500,
                minHeight: 500,
                parent: remote.getCurrentWindow(),
                icon: path.join(__static, 'icon.png')
              })

              win.removeMenu()
              await win.loadURL(`http://localhost:${Config.services.port}/api/auth/discord`)

              win.on('closed', () => {
                win = null
                this.error = ''
                this.loading = false
              })

              win.webContents.on('did-frame-navigate', async (event, url, httpResponseCode) => {
                const redirect = new URL(url)
                if (redirect.pathname === Config.services.redirect) {
                  win.close()

                  if (httpResponseCode !== 401) this.login(false)
                }
              })

              if (!isDevelopment) {
                win.on('focus', () => {
                  globalShortcut.register('CommandOrControl+R', () => {})
                })

                win.on('blur', () => {
                  globalShortcut.unregister('CommandOrControl+R')
                })
              }
            }

            break
        }
      } else {
        this.success = true
        this.error = ''
        ipcRenderer.send('login')
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
