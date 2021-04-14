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
      v-if="(item.status.class === 'success' && item.transactionData.method !== 'PayPal')"
      outlined
      small
      color="success"
      class="text-capitalize pointer"
      v-text="`Size: ${item.transactionData.product.size} - proceed to checkout!`"
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
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
