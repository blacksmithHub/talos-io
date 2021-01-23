<template>
  <div>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-form @submit.prevent="submit">
        <v-card>
          <v-card-title style="border-bottom:1px solid #d85820">
            <span
              class="headline primary--text"
              v-text="'Import Banks'"
            />

            <v-spacer />

            <v-btn
              icon
              class="primary--text"
              @click="onCancel"
            >
              <v-icon v-text="'mdi-close'" />
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-container>
              <v-file-input
                v-model="csv"
                label="File input"
                accept=".csv"
                :error-messages="fileErrors"
                outlined
                dense
                prepend-icon=""
                hide-details="auto"
                hint="Import .csv file only"
                @change="validateFile"
              />
            </v-container>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-container class="text-right">
              <v-btn
                class="primary mr-2"
                rounded
                small
                depressed
                @click="onCancel"
                v-text="'close'"
              />
              <v-btn
                class="primary"
                rounded
                depressed
                type="submit"
                small
                v-text="'save'"
              />
            </v-container>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-snackbar v-model="snackbar">
      Banks successfully imported

      <template v-slot:action="{ attrs }">
        <v-btn
          icon
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon v-text="'mdi-close'" />
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      snackbar: false,
      dialog: false,
      csv: null,
      fileErrors: [],
      newBanks: []
    }
  },
  watch: {
    newBanks () {
      if (!this.newBanks.length) this.fileErrors.push('Invalid records')
    }
  },
  methods: {
    ...mapActions('bank', { addBank: 'addItem' }),
    /**
     * Validate input file
     *
     */
    validateFile () {
      this.fileErrors = []

      if (this.csv) {
        const ext = this.csv.name.split('.')

        if (ext[ext.length - 1] !== 'csv') {
          this.fileErrors.push('Invalid file')
        } else {
          const csvToJson = require('convert-csv-to-json')

          const json = csvToJson.getJsonFromCsv(this.csv.path)

          const result = []

          json.forEach(element => {
            for (const [key, value] of Object.entries(element)) {
              const columns = key.split(',')
              const rows = value.split(',')

              const parse = {}

              columns.forEach((clm, i) => {
                parse[clm] = rows[i]
              })

              result.push(parse)
            }
          })

          this.newBanks = []

          result.forEach(element => {
            if (element.bank && parseInt(element.cardNumber)) {
              this.newBanks.push({
                cardHolder: (element.cardHolder) ? element.cardHolder.trim() : null,
                cardNumber: parseInt(element.cardNumber),
                cvv: parseInt(element.cvv) || null,
                expiryMonth: element.expiryMonth || null,
                expiryYear: element.expiryYear || null,
                bank: element.bank || null,
                nickname: (element.nickname) ? element.nickname.trim() : null
              })
            }
          })
        }
      } else {
        this.fileErrors.push('Required')
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.fileErrors = []
      this.newBanks = []
      this.csv = null
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      if (!this.fileErrors.length && this.newBanks.length) {
        this.newBanks.forEach(element => this.addBank(element))

        this.snackbar = true
      }
    }
  }
}
</script>
