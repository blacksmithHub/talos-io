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
              v-text="'Import Profiles'"
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
      Profiles successfully imported

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
      profiles: []
    }
  },
  watch: {
    profiles () {
      if (!this.profiles.length) this.fileErrors.push('Invalid records')
    }
  },
  methods: {
    ...mapActions('profile', { addProfile: 'addItem' }),
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

          this.profiles = []

          result.forEach(element => {
            if (element.email && element.password) {
              this.profiles.push({
                name: (element.name) ? element.name.trim() : null,
                email: element.email.trim(),
                password: element.password.trim(),
                paypal: {}
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
      this.profiles = []
      this.csv = null
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      if (!this.fileErrors.length && this.profiles.length) {
        this.profiles.forEach(element => this.addProfile(element))

        this.snackbar = true
      }
    }
  }
}
</script>
