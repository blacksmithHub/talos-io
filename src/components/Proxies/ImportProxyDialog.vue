<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title>
          <span
            class="headline"
            v-text="'Import Proxies'"
          />

          <v-spacer />

          <v-btn
            icon
            @click="onCancel"
          >
            <v-icon v-text="'mdi-close'" />
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-container class="text-center">
            Under Maintenance
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-container class="text-right">
            <v-btn
              class="primary"
              rounded
              depressed
              small
              @click="onCancel"
              v-text="'close'"
            />
          </v-container>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialog: false
    }
  },
  methods: {
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.dialog = false
    }
  }
}
</script>
