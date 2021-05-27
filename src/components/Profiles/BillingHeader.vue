<template>
  <div>
    <v-row
      align="center"
      no-gutters
      class="py-2 px-3"
    >
      <v-col
        cols="2"
        align-self="center"
      >
        <h3
          class="cursor"
          v-text="'Billings'"
        />
      </v-col>

      <v-col
        cols="10"
        align-self="center"
        class="text-right"
      >
        <v-btn
          rounded
          x-small
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="$refs.billingDialog.dialog = true"
        >
          <v-icon
            left
            small
            v-text="'mdi-plus'"
          />
          <span v-text="'create'" />
        </v-btn>

        <v-btn
          rounded
          x-small
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="importData"
        >
          <v-icon
            left
            small
            v-text="'mdi-download'"
          />
          <span v-text="'import'" />
        </v-btn>

        <v-btn
          rounded
          x-small
          color="primary"
          depressed
          outlined
          @click="exportJson(billings, 'Export Billings To JSON')"
        >
          <v-icon
            left
            small
            v-text="'mdi-upload'"
          />
          <span v-text="'export'" />
        </v-btn>
      </v-col>
    </v-row>

    <BillingDialog ref="billingDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import File from '@/mixins/file'
import BillingDialog from '@/components/Profiles/BillingDialog.vue'

export default {
  components: {
    BillingDialog
  },
  mixins: [File],
  computed: {
    ...mapState('billing', { billings: 'items' })
  },
  methods: {
    ...mapActions('billing', ['addItem']),

    async importData () {
      const data = await this.importJson('Import Billings')

      if (data && data.length) {
        for (let index = 0; index < data.length; index++) {
          await delete data[index].id
          await this.addItem(data[index])
        }
      }
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
