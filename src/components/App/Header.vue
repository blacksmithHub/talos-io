<template>
  <v-app-bar
    app
    dense
    class="titleBar"
  >
    <v-row no-gutters>
      <v-col
        cols="1"
        class="titleBar"
        align-self="center"
      >
        <div class="d-flex align-center">
          <v-img
            class="shrink mr-2"
            contain
            :src="require('@/assets/talos.png')"
            transition="scale-transition"
            width="35"
          />
        </div>
      </v-col>

      <v-col align-self="center">
        <v-tabs
          :value="tab"
          background-color="transparent"
          grow
          slider-color="primary"
          centered
          @change="setCurrentTab"
        >
          <v-tab
            v-for="item in items"
            :key="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
      </v-col>

      <v-col cols="1">
        <v-row
          no-gutters
          class="text-right mt-1"
          justify="center"
          align="center"
        >
          <v-col align-self="center">
            <v-btn
              icon
              x-small
              :ripple="false"
              class="mr-1"
              @click="onMaximize"
            >
              <v-icon
                small
                color="success"
                v-text="'mdi-checkbox-blank-circle'"
              />
            </v-btn>

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
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { remote } from 'electron'

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapState('core', ['tab'])
  },
  methods: {
    ...mapActions('core', ['setCurrentTab']),

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
