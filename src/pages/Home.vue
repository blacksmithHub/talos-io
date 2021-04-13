<template>
  <v-app>
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

    <v-main>
      <v-tabs-items
        v-model="tab"
        class="transparent"
      >
        <v-tab-item
          v-for="item in items"
          :key="item"
        >
          <v-container fluid>
            <Tasks v-if="item === 'Tasks'" />
            <Profiles v-else-if="item === 'Profiles'" />
            <Proxies v-else-if="item === 'Proxies'" />
            <Settings
              v-else-if="item === 'Settings'"
              ref="settings"
            />
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { remote } from 'electron'
import moment from 'moment-timezone'

import Tasks from '@/components/Tasks/Index.vue'
import Profiles from '@/components/Profiles/Index.vue'
import Proxies from '@/components/Proxies/Index.vue'
import Settings from '@/components/Settings/Index.vue'

export default {
  components: {
    Tasks,
    Profiles,
    Proxies,
    Settings
  },
  data () {
    return {
      items: ['Tasks', 'Profiles', 'Proxies', 'Settings']
    }
  },
  computed: {
    ...mapState('core', ['tab']),
    ...mapState('account', { accounts: 'items' })
  },
  created () {
    const vm = this
    setInterval(() => {
      vm.accounts.forEach(el => {
        if (el.paypal.expires_in && moment().isSameOrAfter(moment(el.paypal.expires_in))) {
          vm.updateAccount({
            ...el,
            paypal: {
              ...el,
              account: null,
              expires_in: null
            }
          })
        }
      })
    }, 1000)
  },
  methods: {
    ...mapActions('core', ['setCurrentTab']),
    ...mapActions('account', { updateAccount: 'updateItem' }),

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
