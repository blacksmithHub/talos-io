<template>
  <div class="pa-1">
    <p
      v-if="item.delay"
      class="mb-1"
    >
      <v-icon
        left
        x-small
        v-text="'mdi-timelapse'"
      />
      <small
        class="text-capitalize cursor"
        v-text="`${item.delay}ms`"
      />
    </p>

    <v-chip
      v-if="(item.status.class === 'success' && item.transactionData.method !== 'PayPal' && !item.autoPay)"
      outlined
      small
      color="success"
      class="text-capitalize pointer"
      ripple
      @click="proceedToCheckout"
      v-text="`Size ${item.transactionData.product.size} - checkout! (${item.transactionData.method})`"
    />

    <v-chip
      v-else
      outlined
      small
      :color="item.status.class"
      class="text-capitalize"
      v-text="item.status.msg"
    />

    <p
      v-if="item.placeOrder"
      class="mb-0 mt-1"
    >
      <v-icon
        left
        x-small
        v-text="'mdi-alarm-check'"
      />
      <small
        class="cursor"
        v-text="$moment(item.placeOrder, 'HH:mm').format('h:mm:ss a')"
      />
    </p>
  </div>
</template>

<script>
import Titan22 from '@/services/Titan22/index'

export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    proceedToCheckout () {
      Titan22.redirectToCheckout(this.item.id)
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
