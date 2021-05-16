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
    proxies () {
      try {
        this.proxies.forEach(el => {
          const tasks = this.tasks.slice().filter((val) => val.proxy.id === el.id)

          if (tasks.length) {
            if (el.distribute) {
              const distributedProxy = DA(el.proxies, tasks.length)
              const distributedConfigs = DA(el.configs, tasks.length)

              for (let index = 0; index < distributedProxy.length; index++) {
                const task = tasks[index]

                const data = {
                  ...task
                }

                if (distributedProxy[index].length) {
                  data.proxy = {
                    ...el,
                    proxies: distributedProxy[index],
                    configs: distributedConfigs[index]
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
                    userAgent: userAgent.toString()
                  }
                })

                this.updateTask(data)
              }
            } else {
              tasks.forEach(task => {
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
              })
            }
          }

          if (this.settings.monitorProxy.id === el.id) {
            this.setSettings({
              ...this.settings,
              monitorProxy: el
            })
          }
        })
      } catch (error) {
        console.log(error)
      }
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
    ...mapActions('account', { updateAccount: 'updateItem' }),
    ...mapActions('task', { updateTask: 'updateItem' }),
    ...mapActions('settings', { setSettings: 'setItems' })
  }
}
</script>
