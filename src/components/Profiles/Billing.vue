<template>
  <div>
    <v-layout
      v-resize="onResize"
      fluid
    >
      <v-data-table
        :height="windowSize.y - 50 - 10 - 45 - 22"
        style="width: 100%"
        class="elevation-2"
        no-data-text="Nothing to display"
        no-results-text="Nothing to display"
        :headers="headers"
        :items="billings"
        item-key="id"
        hide-default-footer
        :items-per-page="billings.length"
        fixed-header
        disable-pagination
      >
        <template v-slot:top>
          <BillingHeader />
          <v-divider style="border:1px solid #d85820" />
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <div
            class="row cursor"
            style="width: 200px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.name"
            />
          </div>
        </template>

        <template v-slot:item.actions="{item}">
          <div>
            <v-btn
              icon
              color="warning"
              depressed
              @click="$refs.billingDialog.onEdit(item.id)"
            >
              <v-icon
                small
                v-text="'mdi-pencil'"
              />
            </v-btn>

            <v-btn
              icon
              color="red"
              depressed
              @click="onDelete(item)"
            >
              <v-icon
                small
                v-text="'mdi-delete'"
              />
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-layout>

    <BillingDialog ref="billingDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import BillingHeader from '@/components/Profiles/BillingHeader.vue'
import BillingDialog from '@/components/Profiles/BillingDialog.vue'

export default {
  components: {
    BillingHeader,
    BillingDialog
  },
  data () {
    return {
      headers: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'center',
          filterable: false,
          sortable: false
        }
      ],
      windowSize: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapState('billing', { billings: 'items' })
  },
  methods: {
    ...mapActions('billing', { updateBilling: 'updateItem', deleteBilling: 'deleteItem' }),

    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    onDelete (item) {
      const index = this.billings.findIndex((el) => el.id === item.id)
      this.deleteBilling(index)
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
