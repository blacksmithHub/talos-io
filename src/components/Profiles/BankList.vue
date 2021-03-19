<template>
  <v-card>
    <v-card-title style="border-bottom: 1px solid #d85820">
      <v-toolbar
        dense
        rounded
      >
        <v-row
          no-gutters
          justify="center"
        >
          <v-col
            cols="3"
            class="text-center"
          >
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
              depressed
              @click="addNewBank"
            >
              <v-icon
                :left="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                v-text="'mdi-plus'"
              />
              <span
                v-if="$vuetify.breakpoint.lgAndUp"
                v-text="'add bank'"
              />
            </v-btn>
          </v-col>

          <v-col
            cols="3"
            class="text-center"
          >
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
              depressed
              @click="importBanks"
            >
              <v-icon
                :left="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                v-text="'mdi-upload'"
              />
              <span
                v-if="$vuetify.breakpoint.lgAndUp"
                v-text="'import banks'"
              />
            </v-btn>
          </v-col>

          <v-col
            cols="3"
            class="text-center"
          >
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="error"
              depressed
              @click="confirmDeleteAll()"
            >
              <v-icon
                :left="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                v-text="'mdi-delete'"
              />
              <span
                v-if="$vuetify.breakpoint.lgAndUp"
                v-text="'delete all banks'"
              />
            </v-btn>
          </v-col>
        </v-row>
      </v-toolbar>
    </v-card-title>

    <v-divider />

    <v-card-text style="max-height: 65vh; overflow: auto">
      <v-list
        v-if="banks.length"
        class="pa-0"
        three-line
        dense
      >
        <template v-for="(bank, index) in banks">
          <v-list-item
            :key="`${index}-item`"
            class="pa-0"
          >
            <v-list-item-content>
              <v-row no-gutters>
                <v-col
                  cols="6"
                  align-self="center"
                >
                  <v-row
                    align="center"
                    no-gutters
                  >
                    <v-col
                      cols="12"
                      align-self="center"
                      class="mb-2"
                    >
                      <h3
                        class="d-inline-block text-truncate"
                        style="max-width: 40vh"
                        v-text="bank.nickname"
                      />
                    </v-col>

                    <v-col
                      cols="12"
                      md="3"
                      align-self="center"
                    >
                      <span
                        class="d-inline-block text-truncate"
                        style="max-width: 40vh"
                      >
                        <span
                          class="text-capitalize font-weight-bold"
                          v-text="'bank:'"
                        />
                        {{ bank.bank }}
                      </span>
                    </v-col>

                    <v-col
                      cols="12"
                      md="3"
                      align-self="center"
                    >
                      <span
                        class="d-inline-block text-truncate"
                        style="max-width: 40vh"
                      >
                        <span
                          class="text-capitalize font-weight-bold"
                          v-text="'Card Holder:'"
                        />
                        {{ bank.cardHolder || 'N/A' }}
                      </span>
                    </v-col>

                    <v-col
                      cols="12"
                      md="3"
                      align-self="center"
                    >
                      <span
                        class="d-inline-block text-truncate"
                        style="max-width: 40vh"
                      >
                        <span
                          class="text-capitalize font-weight-bold"
                          v-text="'Card Number:'"
                        />
                        <input
                          :value="bank.cardNumber"
                          class="ml-1 grey--text"
                          readonly
                          disabled
                          type="password"
                        >
                      </span>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col
                  align-self="center"
                  class="text-right"
                  cols="6"
                >
                  <v-btn
                    icon
                    color="primary"
                    class="mr-2"
                    @click="editBank(bank)"
                  >
                    <v-icon
                      small
                      v-text="'mdi-pencil'"
                    />
                  </v-btn>

                  <v-btn
                    icon
                    color="error"
                    class="mr-2"
                    @click="confirmDelete(index)"
                  >
                    <v-icon
                      small
                      v-text="'mdi-delete'"
                    />
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>

          <v-divider
            v-if="index < banks.length - 1"
            :key="`${index}-divider`"
          />
        </template>
      </v-list>

      <v-list v-else>
        <v-list-item class="pa-0 list">
          <v-list-item-content class="pa-2 text-center">
            <small v-text="'Nothing to display'" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <BankDialog ref="bankDialog" />
      <ImportBankDialog ref="importBankDialog" />
    </v-card-text>

    <v-divider />

    <v-card-actions>
      <v-row no-gutters>
        <v-col cols="6">
          <small
            style="max-width: 100%"
            class="text-capitalize text-truncate d-inline-block"
            v-text="`total: ${banks.length}`"
          />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import BankDialog from '@/components/Profiles/BankDialog'
import ImportBankDialog from '@/components/Profiles/ImportBankDialog'

export default {
  components: {
    BankDialog,
    ImportBankDialog
  },
  computed: {
    ...mapState('bank', { banks: 'items' })
  },
  methods: {
    ...mapActions('bank', { deleteBank: 'deleteItem', reset: 'reset' }),
    ...mapActions('dialog', ['openDialog']),

    /**
     * Trigger add new bank dialog event.
     */
    addNewBank () {
      this.$refs.bankDialog.dialog = true
    },
    /**
     * Trigger edit bank dialog event.
     */
    editBank (bank) {
      this.$refs.bankDialog.mapData(bank)
    },
    /**
     * Trigger import bank dialog event.
     */
    importBanks () {
      this.$refs.importBankDialog.dialog = true
    },

    confirmDelete (index) {
      this.openDialog({
        title: 'Confirmation',
        body: 'Are you sure you want to delete this bank?',
        action: () => {
          this.deleteBank(index)
        }
      })
    },

    confirmDeleteAll () {
      if (this.banks.length) {
        this.openDialog({
          title: 'Confirmation',
          body: 'Are you sure you want to delete all banks?',
          action: () => {
            this.reset()
          }
        })
      }
    }
  }
}
</script>
