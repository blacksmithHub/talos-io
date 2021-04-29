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

export default {
  components: {
    SnackBar,
    Dialog
  },
  data () {
    return {
      //
    }
  },
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
    await this.initProxy()

    if (this.accounts.length) await this.initAccount()

    if (this.tasks.length) await this.initTask()

    if (!Object.keys(this.cloudflare).length) await this.resetCf()

    await this.initCf()

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
  },
  methods: {
    ...mapActions('settings', { initSettings: 'reset', setSettings: 'setItems' }),
    ...mapActions('proxy', { initProxy: 'init' }),
    ...mapActions('account', { initAccount: 'init' }),
    ...mapActions('task', { initTask: 'init' }),
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
