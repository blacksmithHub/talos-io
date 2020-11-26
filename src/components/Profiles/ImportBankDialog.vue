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
            v-text="'Import Banks'"
          />
        </v-card-title>

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

        <v-card-actions class="justify-end">
          <v-btn
            class="primary"
            rounded
            small
            @click="onCancel"
            v-text="'cancel'"
          />
          <v-btn
            class="primary"
            rounded
            type="submit"
            small
            v-text="'save'"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data () {
    return {
      dialog: false,
      csv: null,
      fileErrors: [],
      newBanks: []
    }
  },
  computed: {
    ...mapState('staticBank', { banks: 'items' })
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
            const bank = (element.bank) ? this.banks.find((val) => val.name.toLowerCase() === element.bank.toLowerCase().trim()) : null

            if (bank && parseInt(element.cardNumber)) {
              this.newBanks.push({
                cardHolder: (element.cardHolder) ? element.cardHolder.trim() : null,
                cardNumber: parseInt(element.cardNumber),
                cvv: parseInt(element.cvv) || null,
                expiryMonth: element.expiryMonth || null,
                expiryYear: element.expiryYear || null,
                bank: {
                  id: bank.id,
                  name: bank.name
                },
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
      this.csv = null
      this.dialog = false

      this.fileErrors = []
      this.newBanks = []
    },
    /**
     * On submit event.
     *
     */
    submit () {
      if (!this.fileErrors.length && this.newBanks.length) {
        this.newBanks.forEach(element => this.addBank(element))

        this.onCancel()
      }
    }
  }
}
</script>
