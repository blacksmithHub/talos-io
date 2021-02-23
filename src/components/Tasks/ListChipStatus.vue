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
      v-text="`Size: ${getSize} - copy checkout cookie!`"
    />

    <v-chip
      v-else-if="(task.status.class === 'success' && task.transactionData.method !== 'PayPal' && !settings.autoPay)"
      outlined
      small
      color="success"
      class="text-capitalize pointer"
      @click="proceedToCheckout"
      v-text="`Size: ${getSize} - proceed to checkout!`"
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
        v-text="$moment(task.placeOrder, 'HH:mm').format('h:mm:ss a')"
      />
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

import Titan22 from '@/services/Titan22/index'

export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' }),
    getSize () {
      return this.task.transactionData.product.size
    }
  },
  methods: {
    /**
     * On copy event.
     *
     */
    onCopy () {
      Toastify({
        text: 'You just copied a cookie',
        duration: 3000,
        newWindow: true,
        close: false,
        gravity: 'bottom',
        position: 'left',
        backgroundColor: '#399cbd',
        className: 'toastify'
      }).showToast()
    },
    /**
     * Redirect to checkout page
     */
    proceedToCheckout () {
      Titan22.redirectToCheckout(this.task.id)
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
