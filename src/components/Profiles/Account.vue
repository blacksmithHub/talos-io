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
        :items="accounts"
        item-key="id"
        hide-default-footer
        :items-per-page="accounts.length"
        fixed-header
        disable-pagination
      >
        <template v-slot:top>
          <AccountHeader @paypalLogin="paypalLogin" />
          <v-divider style="border:1px solid #d85820" />
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
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
              color="paypalLogin"
              depressed
              @click="paypalLogin(item)"
            >
              <vue-fontawesome icon="paypal" />
            </v-btn>

            <v-btn
              icon
              color="warning"
              depressed
              :disabled="item.loading"
              @click="$refs.accountDialog.onEdit(item.id)"
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

    <AccountDialog ref="accountDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import AccountHeader from '@/components/Profiles/AccountHeader.vue'
import AccountDialog from '@/components/Profiles/AccountDialog.vue'

export default {
  components: {
    AccountHeader,
    AccountDialog
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
    ...mapState('account', { accounts: 'items' })
  },
  methods: {
    ...mapActions('account', { updateAccount: 'updateItem', deleteAccount: 'deleteItem' }),

    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    onDelete (item) {
      const index = this.accounts.findIndex((el) => el.id === item.id)
      // TODO: close pp window
      this.deleteAccount(index)
    },
    paypalLogin (item) {
      this.updateAccount({
        ...item,
        loading: true
      })
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
