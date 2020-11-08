<template>
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

      <v-list-item link>
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
</template>

<script>
import { ipcRenderer } from 'electron'
import auth from '@/services/auth'
import placeholder from '@/assets/placeholder.png'

export default {
  computed: {
    avatar () {
      if (!auth.isAuthenticated()) return placeholder

      return `https://cdn.discordapp.com/avatars/${auth.getAuth().id}/${auth.getAuth().avatar}.png`
    },
    username () {
      if (!auth.isAuthenticated()) return 'John Doe'

      return auth.getAuth().username
    },
    email () {
      if (!auth.isAuthenticated()) return 'johndoe@mail.com'

      return auth.getAuth().email
    }
  },
  methods: {
    launchMonitor () {
      ipcRenderer.send('toggle-monitor', true)
    },
    launchProfiles () {
      ipcRenderer.send('toggle-profiles')
    },
    launchSettings () {
      ipcRenderer.send('toggle-settings')
    }
  }
}
</script>
