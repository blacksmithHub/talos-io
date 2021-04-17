<template>
  <v-footer
    padless
    flat
    class="px-5 py-1"
  >
    <v-row no-gutters>
      <v-col class="caption">
        <span>
          Tasks: {{ tasks.length }} | Checkouts: <span class="success--text">{{ tasks.filter((el) => el.status.class === 'success').length }}</span>
        </span>
      </v-col>

      <v-col
        class="text-right caption"
      >
        <digital-clock
          :display-seconds="true"
          :twelve-hour="true"
        />
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
import { mapState } from 'vuex'

import DigitalClock from 'vue-digital-clock'

export default {
  components: {
    DigitalClock
  },
  computed: {
    ...mapState('task', { tasks: 'items' })
  }
}
</script>
