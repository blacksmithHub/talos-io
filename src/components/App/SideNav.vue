<template>
  <div>
    <v-navigation-drawer
      app
      permanent
      mini-variant
    >
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img :src="require('@/assets/talos.png')" />
          </v-list-item-avatar>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list
        nav
        dense
        rounded
      >
        <v-tooltip
          right
          content-class="primary"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              link
              v-bind="attrs"
              @click="launchMonitor"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon
                  color="primary"
                  v-text="'mdi-monitor'"
                />
              </v-list-item-icon>
            </v-list-item>
          </template>
          <span>Tooltip</span>
        </v-tooltip>

        <v-tooltip
          right
          content-class="primary"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              link
              v-bind="attrs"
              @click="launchProfiles"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon
                  color="primary"
                  v-text="'mdi-account-group'"
                />
              </v-list-item-icon>
              <v-list-item-title v-text="'Profiles'" />
            </v-list-item>
          </template>
          <span>Profiles</span>
        </v-tooltip>

        <v-tooltip
          right
          content-class="primary"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              link
              v-bind="attrs"
              @click="launchProxies"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon
                  color="primary"
                  v-text="'mdi-incognito'"
                />
              </v-list-item-icon>
              <v-list-item-title v-text="'Proxies'" />
            </v-list-item>
          </template>
          <span>Proxies</span>
        </v-tooltip>

        <v-tooltip
          right
          content-class="primary"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              link
              v-bind="attrs"
              v-on="on"
              @click="launchSettings"
            >
              <v-list-item-icon>
                <v-icon
                  color="primary"
                  v-text="'mdi-tools'"
                />
              </v-list-item-icon>
              <v-list-item-title v-text="'Settings'" />
            </v-list-item>
          </template>
          <span>Settings</span>
        </v-tooltip>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
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
