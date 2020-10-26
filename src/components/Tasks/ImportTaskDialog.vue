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
            v-text="'Import Tasks'"
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
    ...mapState('attribute', { attributes: 'items' }),
    ...mapState('task', { tasks: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('bank', { banks: 'items' })
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem' }),
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
        const a = this.csv.name.split('.')

        if (a[a.length - 1] !== 'csv') {
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

          const newTasks = []

          result.forEach(element => {
            const csvSizes = element.sizes.trim().split('+')

            if (csvSizes.length && element.email && element.password && element.sku) {
              const sizes = []

              csvSizes.forEach((data) => {
                const attr = this.attributes.find((val) => val.sizes.find((size) => size.label.toLowerCase() === data.toLowerCase()))

                if (attr) {
                  const size = attr.sizes.find((val) => val.label.toLowerCase() === data.toLowerCase())

                  sizes.push({
                    attribute_id: attr.attribute_id,
                    label: size.label,
                    value: size.value
                  })
                }
              })

              if (sizes.length) {
                let profile = this.profiles.slice().find((data) => {
                  return data.email === element.email.trim() && data.password === element.password.trim()
                })

                if (!profile) {
                  profile = {
                    id: null,
                    name: element.email.trim(),
                    email: element.email.trim(),
                    password: element.password.trim()
                  }
                }

                let bank = this.banks.slice().find((data) => {
                  return (
                    data.cardHolder.toLowerCase() === ((element.cardHolder) ? element.cardHolder.trim().toLowerCase() : '') &&
                    data.cardNumber === (element.cardNumber || '') &&
                    data.cvv === (parseInt(element.cvv) || '') &&
                    data.expiryMonth === (element.expiryMonth || '') &&
                    data.expiryYear === (element.expiryYear || '') &&
                    data.bank.name.toLowerCase() === ((element.bank) ? element.bank.trim().toLowerCase() : null)
                  )
                })

                if (!bank) {
                  bank = {
                    cardHolder: (element.cardHolder) ? element.cardHolder.trim() : '',
                    cardNumber: parseInt(element.cardNumber) || '',
                    cvv: parseInt(element.cvv) || '',
                    expiryMonth: element.expiryMonth || '',
                    expiryYear: element.expiryYear || '',
                    bank: {
                      id: '',
                      name: (element.bank) ? element.bank.trim() : ''
                    },
                    nickname: (element.bank) ? element.bank.trim() : '',
                    id: ''
                  }
                }

                const object = {
                  bank: bank,
                  profile: profile,
                  name: (element.name) ? element.name.trim() : '',
                  sku: element.sku.trim(),
                  sizes: sizes,
                  delay: element.delay || 1000,
                  placeOrder: element.placeOrder || ''
                }

                if (element.aco) {
                  object.name = (element.id) ? element.id.trim() : ''
                  object.profile.name = (element.id) ? element.id.trim() : ''
                  object.aco = true
                  object.webhook = (element.webhook) ? element.webhook.trim() : ''
                }

                newTasks.push(object)
              }
            }
          })

          newTasks.forEach(element => this.addTask(element))

          this.onCancel()
        }
      }
    }
  }
}
</script>
