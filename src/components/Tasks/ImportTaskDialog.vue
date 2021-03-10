<template>
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
            v-text="'Import Tasks'"
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
              rounded
              small
              class="primary mr-2"
              depressed
              @click="onCancel"
              v-text="'close'"
            />
            <v-btn
              class="primary"
              rounded
              type="submit"
              small
              depressed
              v-text="'save'"
            />
          </v-container>
        </v-card-actions>
      </v-card>
    </v-form>

    <v-snackbar v-model="snackbar">
      Tasks successfully imported

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
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Constant from '@/config/constant'

export default {
  data () {
    return {
      snackbar: false,
      dialog: false,
      csv: null,
      fileErrors: [],
      newTasks: []
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('bank', { banks: 'items' }),
    /**
     * Return all attributes
     */
    attributes () {
      return Constant.TITAN_ATTRIBUTES
    }
  },
  watch: {
    newTasks () {
      if (!this.newTasks.length) this.fileErrors.push('Invalid records')
    },
    dialog () {
      if (this.dialog) this.fileErrors = []
    }
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem' }),
    ...mapActions('core', ['setDialogComponent', 'setDialog']),

    /**
     * Validate input file
     *
     */
    validateFile () {
      try {
        this.fileErrors = []

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

            this.newTasks = []

            result.forEach(element => {
              const csvSizes = (element.sizes) ? element.sizes.trim().split('+') : []

              if (csvSizes.length && element.email && element.password && element.sku) {
                const sizes = []

                csvSizes.forEach((data) => {
                  const attr = this.attributes.find((val) => val.sizes.find((size) => size.label.toLowerCase() === data.toLowerCase()))

                  if (attr && !sizes.find((val) => val.label.toLowerCase() === data.toLowerCase())) {
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

                  let bank = {}

                  if (element.bank && element.cardNumber) {
                    bank = {
                      cardHolder: (element.cardHolder) ? element.cardHolder.trim() : '',
                      cardNumber: parseInt(element.cardNumber) || '',
                      cvv: parseInt(element.cvv) || '',
                      expiryMonth: element.expiryMonth || '',
                      expiryYear: element.expiryYear || '',
                      bank: (element.bank) ? element.bank.trim() : '',
                      nickname: (element.bank) ? element.bank.trim() : '',
                      id: null
                    }
                  }

                  const object = {
                    bank: bank,
                    profile: profile,
                    sku: element.sku.trim(),
                    sizes: sizes,
                    delay: parseInt(element.delay) || 3200,
                    proxy: { id: null, name: 'Localhost', proxies: [] },
                    mode: Constant.CLIENT[0],
                    checkoutMethod: 4,
                    qty: 1,
                    logs: '',
                    paid: false,
                    placeOrder: ''
                  }

                  if (element.aco) {
                    object.profile.name = (element.id) ? element.id.trim() : ''
                    object.aco = true
                    object.webhook = (element.webhook) ? element.webhook.trim() : ''
                  }

                  this.newTasks.push(object)
                }
              }
            })
          }
        } else {
          this.fileErrors.push('Required')
        }
      } catch (error) {
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.csv = null
      this.newTasks = []
      this.fileErrors = []
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      if (!this.fileErrors.length && this.newTasks.length) {
        this.newTasks.forEach(element => this.addTask(element))

        this.snackbar = true
      }
    }
  }
}
</script>
