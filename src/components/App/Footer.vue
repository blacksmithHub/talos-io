<template>
  <v-footer
    padless
    app
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
import Config from '@/config/app'

export default {
  computed: {
    name () {
      return Config.bot.name
    },
    version () {
      return `v${Config.bot.version}`
    }
  }
}
</script>
