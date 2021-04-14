<template>
  <div>
    <v-row
      align="center"
      class="pa-3"
    >
      <v-col cols="1">
        <h3 v-text="'Billings'" />
      </v-col>

      <v-col
        cols="11"
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
          class="mr-3"
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
    ...mapActions('dialog', ['openDialog']),

    async importData () {
      const data = await this.importJson('Import Billings')

      if (data && data.length) {
        data.forEach((el) => {
          delete el.id
          this.addItem(el)
        })
      }
    }
  }
}
</script>
