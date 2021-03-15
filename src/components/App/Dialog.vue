<template>
  <v-dialog
    :value="dialog"
    width="500"
    persistent
  >
    <v-card>
      <v-card-title style="border-bottom:1px solid #d85820">
        <span
          class="headline primary--text"
          v-text="title"
        />

        <v-spacer />

        <v-btn
          icon
          class="primary--text"
          @click="closeAndDisagree()"
        >
          <v-icon v-text="'mdi-close'" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-10 text-center">
        <template v-for="(line, index) in content">
          <p :key="index">
            {{ line }}
          </p>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end pa-5">
        <v-btn
          v-if="!alert"
          color="primary mr-3"
          rounded
          depressed
          small
          @click="closeAndDisagree()"
          v-text="'Cancel'"
        />

        <v-btn
          color="primary"
          rounded
          depressed
          small
          @click="closeAndAgree()"
          v-text="'Ok'"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('dialog', [
      'dialog',
      'title',
      'body',
      'action',
      'cancel',
      'alert'
    ]),
    /**
     * Body content splitted by new line (\n)
     *
     * @return string
     */
    content () {
      return this.body ? this.body.split('\n') : []
    }
  },
  methods: {
    ...mapActions('dialog', ['closeDialog']),

    /**
     * Hides the dialog and executes the action callback function.
     *
     */
    closeAndAgree () {
      if (this.action) this.action()
      this.closeDialog()
    },

    /**
     * Hides the dialog and executes the cancel callback function.
     *
     */
    closeAndDisagree () {
      if (this.cancel) this.cancel()
      this.closeDialog()
    }
  }
}
</script>
