<template>
  <v-snackbar
    :timeout="timeout"
    :top="top"
    :bottom="bottom"
    :right="right"
    :left="left"
    :multi-line="multiLine"
    :vertical="vertical"
    :value="snackbar"
    @input="closeSnackbar"
  >
    {{ message }}
    <template v-slot:action="{ attrs }">
      <v-btn
        icon
        v-bind="attrs"
        @click.native="closeSnackbar"
      >
        <v-icon v-text="'mdi-close'" />
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  computed: {
    ...mapState('snackbar', [
      'timeout',
      'top',
      'bottom',
      'right',
      'left',
      'multiLine',
      'vertical',
      'snackbar',
      'message'
    ])
  },
  methods: {
    ...mapActions('snackbar', ['closeSnackbar'])
  }
}
</script>
