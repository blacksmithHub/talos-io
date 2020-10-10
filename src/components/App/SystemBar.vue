<template>
  <v-system-bar app>
    <v-row
      no-gutters
      class="titleBar"
      justify="center"
      align="center"
    >
      <v-col align-self="center">
        <span v-text="'Titan Bot'" />
      </v-col>
    </v-row>

    <v-btn
      icon
      x-small
      :ripple="false"
      class="mr-1"
      @click="onMinimize"
    >
      <v-icon
        color="warning"
        v-text="'mdi-checkbox-blank-circle'"
      />
    </v-btn>

    <v-btn
      icon
      x-small
      :ripple="false"
      class="mr-1"
      @click="onMaximize"
    >
      <v-icon
        color="success"
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
        color="error"
        v-text="'mdi-checkbox-blank-circle'"
      />
    </v-btn>
  </v-system-bar>
</template>

<script>
import { remote } from 'electron'

export default {
  methods: {
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
  }
}
</script>
