<template>
  <div class="pa-2">
    <p
      v-if="task.delay"
      class="mb-1"
    >
      <v-icon
        left
        x-small
        v-text="'mdi-timelapse'"
      />
      <small
        class="text-capitalize cursor"
        v-text="`${task.delay}ms`"
      />
    </p>

    <v-chip
      v-if="task.status.class === 'success' && task.aco"
      v-clipboard:copy="task.transactionData.cookies.value"
      v-clipboard:success="onCopy"
      outlined
      small
      color="success"
      class="text-capitalize pointer"
      v-text="'copy checkout cookie!'"
    />

    <v-chip
      v-else-if="(task.status.class === 'success' && task.transactionData.method !== 'PayPal' && !settings.autoPay)"
      outlined
      small
      color="success"
      class="text-capitalize pointer"
      @click="$emit('click:checkout', task)"
      v-text="'proceed to checkout!'"
    />

    <v-chip
      v-else
      outlined
      small
      :color="task.status.class"
      class="text-capitalize"
      v-text="task.status.msg"
    />

    <p
      v-if="task.placeOrder"
      class="mb-0 mt-1"
    >
      <v-icon
        left
        x-small
        v-text="'mdi-alarm-check'"
      />
      <small
        class="cursor"
        v-text="$moment(`${$moment().format('YYYY/MM/DD')} ${task.placeOrder}`).format('h:mm:ss a')"
      />
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' })
  },
  methods: {
    /**
     * On copy event.
     *
     */
    onCopy () {
      this.$toast.open({
        message: '<strong style="font-family: Arial; text-transform: uppercase">you just copied a cookie</strong>',
        type: 'info',
        duration: 3000,
        position: 'bottom-left'
      })
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
.pointer {
  cursor: pointer
}
</style>
