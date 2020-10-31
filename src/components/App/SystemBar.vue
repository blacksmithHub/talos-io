<template>
  <v-system-bar app>
    <v-row
      no-gutters
      class="titleBar"
      justify="center"
      align="center"
    >
      <v-col
        cols="6"
        align-self="center"
      >
        <span
          class="text-uppercase"
          v-text="'talos io'"
        />
      </v-col>

      <v-col
        cols="6"
        align-self="center"
      >
        <strong v-text="time" />
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
  data () {
    return {
      time: ''
    }
  },
  created () {
    this.timer()
  },
  methods: {
    timer () {
      const vm = this
      const loop = setTimeout(() => {
        vm.time = vm.$moment().format('h:mm:ss a')
        clearTimeout(loop)
        vm.timer()
      }, 1000)
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
  }
}
</script>
