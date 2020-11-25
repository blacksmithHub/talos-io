<template>
  <v-navigation-drawer
    app
    permanent
    :expand-on-hover="!$vuetify.breakpoint.lgAndUp"
  >
    <v-list>
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img :src="require('@/assets/placeholder.png')" />
        </v-list-item-avatar>
      </v-list-item>

      <v-list-item link>
        <v-list-item-content>
          <v-list-item-title
            class="title"
            v-text="'John Doe'"
          />
          <v-list-item-subtitle v-text="'johndoe@mail.test'" />
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

export default {
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
