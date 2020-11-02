<template>
  <v-alert
    dense
    text
    :type="alertClass"
    :icon="(alertClass === 'success') ? 'mdi-check-circle': 'mdi-alert'"
    tile
    border="left"
  >
    {{ alertMsg }}
  </v-alert>
</template>

<script>
export default {
  props: {
    alertMsg: {
      type: String,
      required: true
    },
    alertClass: {
      type: String,
      required: true
    }
  }
}
</script>
