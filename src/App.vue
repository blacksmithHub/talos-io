<template>
  <v-app>
    <SystemBar />
    <router-view />
    <vue-progress-bar />
  </v-app>
</template>

<script>
import SystemBar from '@/components/App/SystemBar'

export default {
  components: {
    SystemBar
  },
  mounted () {
    //  [App.vue specific] When App.vue is finish loading finish the progress bar
    this.$Progress.finish()
  },
  created () {
    //  [App.vue specific] When App.vue is first loaded start the progress bar
    this.$Progress.start()
    //  hook the progress bar to start before we move router-view
    this.$router.beforeEach((to, from, next) => {
      //  start the progress bar
      this.$Progress.start()
      //  continue to next page
      next()
    })
    //  hook the progress bar to finish after we've finished moving router-view
    this.$router.afterEach(() => this.$Progress.finish())
  }
}
</script>

<style>
html {
  overflow: auto !important
}
.titleBar {
  -webkit-user-select: none !important;
  -webkit-app-region: drag !important;
}
</style>
