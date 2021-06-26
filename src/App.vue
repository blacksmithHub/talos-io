<template>
  <v-app>
    <router-view />
    <SnackBar />
    <Dialog />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import SnackBar from '@/components/App/SnackBar.vue'
import Dialog from '@/components/App/Dialog.vue'
import ProxyDistribution from '@/mixins/proxy-distribution'
import DA from 'distribute-array'

export default {
  components: {
    SnackBar,
    Dialog
  },
  mixins: [ProxyDistribution],
  computed: {
    ...mapState('settings', { settings: 'items' }),
    ...mapState('task', { tasks: 'items' }),
    ...mapState('account', { accounts: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
    ...mapState('cloudflare', { cloudflare: 'items' }),
    ...mapState('monitor', { monitor: 'items' })
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    }
  },
  async created () {
    if (!Object.keys(this.cloudflare).length) await this.resetCf()

    await this.initCf()

    await this.initProxy()

    if (!Object.keys(this.settings).length) {
      await this.initSettings()
      await this.setSettings({
        ...this.settings,
        monitorProxy: { ...this.proxies[0] }
      })
    }

    if (!this.settings.monitorProxy.id) {
      await this.setSettings({
        ...this.settings,
        monitorProxy: { ...this.proxies[0] }
      })
    }

    if (!Object.keys(this.monitor).length) this.initMonitor()

    if (this.accounts.length) await this.initAccount()

    if (this.tasks.length) await this.initTask()

    if (this.tasks.length && this.proxies.length) {
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
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  methods: {
    ...mapActions('settings', { initSettings: 'reset', setSettings: 'setItems' }),
    ...mapActions('proxy', { initProxy: 'init' }),
    ...mapActions('account', { initAccount: 'init' }),
    ...mapActions('task', { initTask: 'init', updateTask: 'updateItem' }),
    ...mapActions('cloudflare', { resetCf: 'reset', initCf: 'init' }),
    ...mapActions('monitor', { initMonitor: 'reset' })
  }
}
</script>

<style>
html {
  overflow-y: auto !important;
  overflow-x: auto !important
}

button {
  -webkit-app-region: no-drag !important;
}

.v-tabs {
  -webkit-app-region: no-drag !important;
}

.titleBar {
  -webkit-user-select: none !important;
  -webkit-app-region: drag !important;
}

/* Let's get this party started */
::-webkit-scrollbar {
  width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
  -webkit-border-radius: 10px;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 10px;
  border-radius: 10px;
  background: grey;
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); */
}
::-webkit-scrollbar-thumb:window-inactive {
  background: grey;
}

.toastify {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
