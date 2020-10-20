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
              @change="fileErrors = []"
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
      fileErrors: []
    }
  },
  computed: {
    ...mapState('staticBank', { banks: 'items' })
  },
  methods: {
    ...mapActions('bank', { addBank: 'addItem' }),
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.csv = null
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
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

          const newBanks = []

          result.forEach(element => {
            const bank = (String(element.bank)) ? this.banks.find((val) => val.name.toLowerCase() === element.bank.toLowerCase().trim()) : null

            if (bank && parseInt(element.cardNumber)) {
              newBanks.push({
                holder: element.cardHolder.trim() || null,
                number: parseInt(element.cardNumber),
                cvv: parseInt(element.cvv) || null,
                expiry: element.expiry || null,
                bank: {
                  id: bank.id,
                  name: bank.name
                },
                nickname: element.name.trim() || null
              })
            }
          })

          newBanks.forEach(element => this.addTask(element))

          this.onCancel()
        }
      }
    }
  }
}
</script>
