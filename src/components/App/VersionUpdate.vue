<template>
  <v-alert
    dense
    text
    :type="alertClass"
    :icon="(alertClass === 'success') ? 'mdi-check-circle': 'mdi-alert'"
    tile
    border="left"
    class="caption"
  >
    {{ alertMsg }}
  </v-alert>
</template>

<script>
export default {
  props: {
    alertMsg: {
      type: String,
      default: String
    },
    alertClass: {
      type: String,
      default: String
    }
  }
}
</script>
