<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <v-card>
        <v-card-title style="border-bottom:1px solid #d85820">
          <span
            class="headline primary--text"
            v-text="`${dialogComponent.header}`"
          />

          <v-spacer />

          <v-btn
            icon
            class="primary--text"
            @click="setDialog(false)"
          >
            <v-icon v-text="'mdi-close'" />
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-5">
          {{ dialogComponent.content }}
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-5">
          <v-btn
            color="primary"
            rounded
            depressed
            small
            @click="setDialog(false)"
            v-text="'Close'"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data () {
    return {
      //
    }
  },
  computed: {
    ...mapState('core', ['dialogComponent', 'dialog'])
  },
  methods: {
    ...mapActions('core', ['setDialog'])
  }
}
</script>
