<template>
  <v-footer
    padless
    inset
    class="transparent"
  >
    <v-col
      class="text-center caption"
      cols="12"
    >
      <small>{{ new Date().getFullYear() }} — <strong>{{ name }}</strong> {{ version }}</small>
    </v-col>
  </v-footer>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('core', ['package']),
    name () {
      return this.package.productName
    },
    version () {
      return `v${this.package.version}`
    }
  }
}
</script>
