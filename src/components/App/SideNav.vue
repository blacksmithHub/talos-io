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
          @click="$refs.account.dialog=true"
        >
          <v-list-item-content>
            <v-list-item-title
              class="title"
              v-text="username"
            />
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
          @click="launchProxies"
        >
          <v-list-item-icon>
            <v-icon v-text="'mdi-incognito'" />
          </v-list-item-icon>
          <v-list-item-title v-text="'Proxies'" />
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

    <AccountDialog ref="account" />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

import placeholder from '@/assets/placeholder.png'
import auth from '@/services/auth'
import AccountDialog from '@/components/App/AccountDialog'

export default {
  components: { AccountDialog },
  computed: {
    /**
     * return avatar
     */
    avatar () {
      if (!auth.isAuthenticated()) return placeholder
      return `https://cdn.discordapp.com/avatars/${auth.getAuth().profile.id}/${auth.getAuth().profile.avatar}.png`
    },
    /**
     * return username
     */
    username () {
      if (!auth.isAuthenticated()) return 'John Doe'
      return auth.getAuth().profile.username
    }
  },
  methods: {
    launchMonitor () {
      ipcRenderer.send('launch-monitor', true)
    },
    launchProfiles () {
      ipcRenderer.send('launch-profile')
    },
    launchProxies () {
      ipcRenderer.send('launch-proxies')
    },
    launchSettings () {
      ipcRenderer.send('launch-setting')
    }
  }
}
</script>
