<template>
  <div>
    <v-navigation-drawer
      app
      permanent
      expand-on-hover
    >
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img :src="avatar" />
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item
          link
          @click="openDialog"
        >
          <v-list-item-content>
            <v-list-item-title
              class="title"
              v-text="username"
            />
            <v-list-item-subtitle v-text="email" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list
        nav
        dense
        rounded
      >
        <v-list-item
          link
          @click="launchMonitor"
        >
          <v-list-item-icon>
            <v-icon v-text="'mdi-monitor'" />
          </v-list-item-icon>
          <v-list-item-title v-text="'Monitor'" />
        </v-list-item>

        <v-list-item
          link
          @click="launchProfiles"
        >
          <v-list-item-icon>
            <v-icon v-text="'mdi-account-group'" />
          </v-list-item-icon>
          <v-list-item-title v-text="'Profiles'" />
        </v-list-item>

        <v-list-item
          link
          @click="launchSettings"
        >
          <v-list-item-icon>
            <v-icon v-text="'mdi-tools'" />
          </v-list-item-icon>
          <v-list-item-title v-text="'Settings'" />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog
      v-model="dialog"
      persistent
      max-width="500px"
    >
      <v-form @submit.prevent="submit">
        <v-card>
          <v-card-title class="justify-end">
            <v-btn
              icon
              small
              :disabled="loading"
              @click="dialog=false"
            >
              <v-icon
                small
                v-text="'mdi-close'"
              />
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col
                cols="2"
                align-self="center"
              >
                <v-img
                  :src="avatar"
                  contain
                  width="50"
                  style="border-radius: 50%"
                />
              </v-col>

              <v-col align-self="center">
                <h3 v-text="username" />
                <span v-text="email" />
              </v-col>

              <v-col
                cols="12"
                align-self="center"
              >
                <Strong v-text="'Master Key: '" />
                {{ masterKey }}

                <v-btn
                  class="primary ml-3"
                  rounded
                  small
                  :loading="loading"
                  @click="unbind"
                >
                  unbind
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import auth from '@/services/auth'
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
    /**
     * return master key
     */
    masterKey () {
      if (!auth.isAuthenticated()) return ''

      return auth.getAuth().key
    },
    /**
     * return avatar
     */
    avatar () {
      if (!auth.isAuthenticated()) return placeholder

      return `https://cdn.discordapp.com/avatars/${auth.getAuth().id}/${auth.getAuth().avatar}.png`
    },
    /**
     * return username
     */
    username () {
      if (!auth.isAuthenticated()) return 'John Doe'

      return auth.getAuth().username
    },
    /**
     * return email
     */
    email () {
      if (!auth.isAuthenticated()) return 'johndoe@mail.com'

      return auth.getAuth().email
    }
  },
  methods: {
    /**
     * open monitor
     */
    launchMonitor () {
      ipcRenderer.send('toggle-monitor', true)
    },
    /**
     * open profiles
     */
    launchProfiles () {
      ipcRenderer.send('toggle-profiles')
    },
    /**
     * open settings
     */
    launchSettings () {
      ipcRenderer.send('toggle-settings')
    },
    /**
     * unbind master key
     */
    async unbind () {
      const params = {
        discord_id: auth.getAuth().id,
        key: auth.getAuth().key
      }

      const response = await AuthAPI.unbind(params)

      if (response.status === 200) {
        this.dialog = false
        auth.flush()
        ipcRenderer.send('hide-home')
        ipcRenderer.send('toggle-login')
      }
    },
    /**
     * open account dialog
     */
    openDialog () {
      if (auth.isAuthenticated()) this.dialog = true
    }
  }
}
</script>
