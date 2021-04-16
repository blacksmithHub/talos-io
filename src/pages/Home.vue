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
import { remote, ipcRenderer } from 'electron'
import moment from 'moment-timezone'

import Tasks from '@/components/Tasks/Index.vue'
import Profiles from '@/components/Profiles/Index.vue'
import Proxies from '@/components/Proxies/Index.vue'
import Settings from '@/components/Settings/Index.vue'

import Auth from '@/services/auth'

const isDevelopment = process.env.NODE_ENV !== 'production'

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
    ...mapState('account', { accounts: 'items' }),
    ...mapState('task', { tasks: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
    ...mapState('billing', { billings: 'items' })
  },
  watch: {
    proxies () {
      this.proxies.forEach(el => {
        const task = this.tasks.find((val) => val.proxy.id === el.id)

        if (task) {
          const data = {
            ...task,
            proxy: el
          }

          const UserAgent = require('user-agents')
          const opt = { deviceCategory: 'desktop' }

          if (data.mode.id !== 1) opt.deviceCategory = 'mobile'

          const userAgent = new UserAgent(opt)

          data.proxy.configs = data.proxy.configs.map((val) => {
            return {
              ...val,
              userAgent: userAgent.toString()
            }
          })

          this.updateTask(data)
        }
      })
    },
    accounts () {
      this.accounts.forEach(el => {
        const task = this.tasks.find((val) => val.account.id === el.id)

        if (task) {
          const data = {
            ...task,
            account: {
              ...task.account,
              paypal: el.paypal
            }
          }

          this.updateTask(data)
        }
      })
    },
    billings () {
      this.billings.forEach(el => {
        const task = this.tasks.find((val) => val.billing.id === el.id)

        if (task) {
          const data = {
            ...task,
            billing: el
          }

          this.updateTask(data)
        }
      })
    }
  },
  created () {
    ipcRenderer.on('updateTask', (event, arg) => {
      this.updateTask({
        ...this.tasks.find((val) => val.id === arg),
        paid: true
      })
    })

    // Check paypal expiration
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

    // Check authentication
    if (!isDevelopment) {
      const loop = setInterval(async () => {
        const params = { key: Auth.getAuth().key }
        const response = await Auth.verify(params).then(res => res).catch(err => err)

        if (!response.data) {
          clearInterval(loop)
          ipcRenderer.send('logout')
        }
      }, 3600000)
    }
  },
  methods: {
    ...mapActions('core', ['setCurrentTab']),
    ...mapActions('account', { updateAccount: 'updateItem' }),
    ...mapActions('task', { updateTask: 'updateItem' }),

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
