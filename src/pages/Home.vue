<template>
  <v-app>
    <!-- <Sidenav /> -->
    <v-main>
      <Tasks />
    </v-main>
  </v-app>
</template>

<script>
// import Sidenav from '@/components/App/Sidenav'
import Tasks from '@/components/Tasks'

export default {
  components: {
    // Sidenav,
    Tasks
  },
  data () {
    return {
      //
    }
  }
}
</script>
