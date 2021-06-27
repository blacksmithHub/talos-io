<template>
  <v-app>
    <Header :items.sync="items" />

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
import { ipcRenderer } from 'electron'
import moment from 'moment-timezone'
import DA from 'distribute-array'

import Tasks from '@/components/Tasks/Index.vue'
import Profiles from '@/components/Profiles/Index.vue'
import Proxies from '@/components/Proxies/Index.vue'
import Settings from '@/components/Settings/Index.vue'
import Header from '@/components/App/Header'

import Auth from '@/services/auth'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default {
  components: {
    Tasks,
    Profiles,
    Proxies,
    Settings,
    Header
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
    ...mapState('billing', { billings: 'items' }),
    ...mapState('settings', { settings: 'items' })
  },
  watch: {
    async proxies () {
      try {
        for (let one = 0; one < this.proxies.length; one++) {
          const tasks = this.tasks.slice().filter((val) => val.proxy.id === this.proxies[one].id)

          if (tasks.length) {
            if (this.proxies[one].distribute) {
              const distributedProxy = DA(this.proxies[one].proxies, tasks.length)
              const distributedConfigs = DA(this.proxies[one].configs, tasks.length)

              for (let two = 0; two < distributedProxy.length; two++) {
                const data = { ...tasks[two] }

                if (distributedProxy[two].length && distributedConfigs[two].length) {
                  data.proxy = {
                    ...this.proxies[one],
                    proxies: distributedProxy[two],
                    configs: distributedConfigs[two]
                  }
                } else {
                  const local = this.proxies.slice().find((val) => val.id === 1)
                  data.proxy = local
                }

                const UserAgent = require('user-agents')
                const opt = { deviceCategory: 'desktop' }

                if (data.mode.id !== 1) opt.deviceCategory = 'mobile'

                const userAgent = new UserAgent(opt)

                data.proxy.configs = data.proxy.configs.map((val) => {
                  return {
                    ...val,
                    userAgent: userAgent.toString(),
                    retry: 1
                  }
                })

                this.updateTask(data)
              }
            } else {
              for (let three = 0; three < tasks.length; three++) {
                const data = {
                  ...tasks[three],
                  proxy: this.proxies[one]
                }

                const UserAgent = require('user-agents')
                const opt = { deviceCategory: 'desktop' }

                if (data.mode.id !== 1) opt.deviceCategory = 'mobile'

                const userAgent = new UserAgent(opt)

                data.proxy.configs = data.proxy.configs.map((val) => {
                  return {
                    ...val,
                    userAgent: userAgent.toString(),
                    retry: 1
                  }
                })

                await this.updateTask(data)
              }
            }
          }

          if (this.settings.monitorProxy.id === this.proxies[one].id) {
            this.setSettings({
              ...this.settings,
              monitorProxy: this.proxies[one]
            })
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    accounts () {
      for (let index = 0; index < this.accounts.length; index++) {
        const task = this.tasks.find((val) => val.account.id === this.accounts[index].id)

        if (task) {
          const data = {
            ...task,
            account: {
              ...task.account,
              paypal: this.accounts[index].paypal
            }
          }

          this.updateTask(data)
        }
      }
    },
    billings () {
      for (let index = 0; index < this.billings.length; index++) {
        const task = this.tasks.find((val) => val.billing.id === this.billings[index].id)

        if (task) {
          const data = {
            ...task,
            billing: this.billings[index]
          }

          this.updateTask(data)
        }
      }
    }
  },
  created () {
    // update specific task
    ipcRenderer.on('updateTask', (event, arg) => {
      this.updateTask({
        ...this.tasks.find((val) => val.id === arg),
        paid: true
      })
    })

    // Check paypal expiration
    const vm = this
    setInterval(() => {
      for (let index = 0; index < vm.accounts.length; index++) {
        if (vm.accounts[index].paypal.expires_in && moment().isSameOrAfter(moment(vm.accounts[index].paypal.expires_in))) {
          vm.updateAccount({
            ...vm.accounts[index],
            paypal: {
              ...vm.accounts[index].paypal,
              account: null,
              expires_in: null
            }
          })
        }
      }
    }, 1000)

    // Check authentication
    if (!isDevelopment) {
      const loop = setInterval(async () => {
        const isAuthenticated = await Auth.isAuthenticated()

        if (!isAuthenticated) {
          clearInterval(loop)
          ipcRenderer.send('logout')
        }
      }, 300000)
    }
  },
  methods: {
    ...mapActions('account', { updateAccount: 'updateItem' }),
    ...mapActions('task', { updateTask: 'updateItem' }),
    ...mapActions('settings', { setSettings: 'setItems' })
  }
}
</script>
