<template>
  <div>
    <v-row
      align="center"
      class="pa-3"
    >
      <v-col cols="1">
        <h3 v-text="'Accounts'" />
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
          @click="$refs.accountDialog.dialog = true"
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
          @click="exportJson(accounts, 'Export Accounts To JSON')"
        >
          <v-icon
            left
            small
            v-text="'mdi-upload'"
          />
          <span v-text="'export'" />
        </v-btn>

        <v-btn
          rounded
          x-small
          color="paypalLogin"
          depressed
          outlined
          @click="paypalLogin"
        >
          <vue-fontawesome icon="paypal" />
          <span
            class="ml-2"
            v-text="'paypal'"
          />
        </v-btn>
      </v-col>
    </v-row>

    <AccountDialog ref="accountDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import File from '@/mixins/file'
import AccountDialog from '@/components/Profiles/AccountDialog.vue'

export default {
  components: {
    AccountDialog
  },
  mixins: [File],
  computed: {
    ...mapState('account', { accounts: 'items' })
  },
  methods: {
    ...mapActions('account', ['addItem']),
    ...mapActions('dialog', ['openDialog']),

    async importData () {
      const data = await this.importJson('Import Accounts')

      if (data && data.length) {
        data.forEach((el) => {
          delete el.id
          this.addItem(el)
        })
      }
    },
    paypalLogin () {
      // TODO: paypal for all
      // this.accounts.forEach((el) => {
      //   if (!el.loading && !el.paypal.account) this.$emit('paypalLogin', el)
      // })
    }
  }
}
</script>
