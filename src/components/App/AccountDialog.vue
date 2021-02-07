<template>
  <v-dialog
    v-model="dialog"
    width="500"
    persistent
  >
    <v-card>
      <v-card-title class="justify-end">
        <v-btn
          icon
          :disabled="loading"
          class="primary--text"
          @click="dialog=false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="3">
            <v-avatar
              size="100px"
            >
              <img :src="avatar">
            </v-avatar>
          </v-col>

          <v-col>
            <v-row no-gutters>
              <v-col cols="12">
                <strong>{{ username }}</strong>
                <br>
                <span>Key: {{ key }}</span>
                <br>
                <span>Expiry: N/A</span>
              </v-col>

              <v-col
                cols="12"
                class="text-right"
                @click="reset"
              >
                <v-btn
                  class="error"
                  small
                  rounded
                  :loading="loading"
                >
                  reset
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ipcRenderer } from 'electron'

import AuthService from '@/services/auth'
import placeholder from '@/assets/placeholder.png'
import AuthAPI from '@/api/auth'

export default {
  data () {
    return {
      dialog: false,
      loading: false
    }
  },
  computed: {
    username () {
      if (!AuthService.isAuthenticated()) return 'John Doe'

      return AuthService.getAuth().profile.username
    },
    key () {
      if (!AuthService.isAuthenticated()) return ''

      return AuthService.getAuth().key
    },
    avatar () {
      if (!AuthService.isAuthenticated()) return placeholder

      return `https://cdn.discordapp.com/avatars/${AuthService.getAuth().profile.id}/${AuthService.getAuth().profile.avatar}.png`
    }
  },
  methods: {
    openDialog () {
      this.dialog = true
    },
    reset () {
      this.loading = true

      AuthAPI.unbind({
        discord_id: AuthService.getAuth().profile.id,
        key: AuthService.getAuth().key
      })
        .then((res) => {
          if (res.status === 200) {
            AuthService.flush()
            sessionStorage.clear()
            ipcRenderer.send('authenticate')
          }
        })

      this.loading = false
    }
  }
}
</script>
