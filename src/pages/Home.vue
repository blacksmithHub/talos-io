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
import Footer from '@/components/App/Footer'
import SystemBar from '@/components/App/SystemBar'

export default {
  components: {
    Footer,
    SystemBar
  }
}
</script>
