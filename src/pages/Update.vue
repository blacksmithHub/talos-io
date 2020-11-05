<template>
  <v-app>
    <v-main>
      <v-container class="fill-height">
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
                cols="6"
              >
                <v-img
                  :src="require('@/assets/icon.png')"
                  contain
                  width="100"
                />
              </v-col>
            </v-row>

            <span
              class="text-capitalize font-italic caption"
              v-text="msg"
            />

            <br>

            <v-progress-circular
              :size="25"
              :width="2"
              color="primary"
              class="mt-3"
              indeterminate
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data () {
    return {
      msg: 'checking for update'
    }
  },
  created () {
    ipcRenderer.on('versionUpdate', (event, arg) => {
      this.msg = arg
    })
  }
}
</script>
