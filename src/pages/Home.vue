<template>
  <v-app>
    <SystemBar />
    <v-main>
      <router-view />
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron'

import Footer from '@/components/App/Footer'
import SystemBar from '@/components/App/SystemBar'
import auth from '@/services/auth'

export default {
  components: {
    Footer,
    SystemBar
  },
  created () {
    if (auth.isAuthenticated()) ipcRenderer.send('toggle-home')
  }
}
</script>
