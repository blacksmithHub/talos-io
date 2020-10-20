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
            v-text="'Import Profiles'"
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
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      dialog: false,
      csv: null,
      fileErrors: []
    }
  },
  methods: {
    ...mapActions('profile', { addProfile: 'addItem' }),
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

          const newProfiles = []

          result.forEach(element => {
            if (element.email && element.password) {
              newProfiles.push({
                name: element.name.trim() || null,
                email: element.email.trim(),
                password: element.password.trim()
              })
            }
          })

          newProfiles.forEach(element => this.addProfile(element))

          this.onCancel()
        }
      }
    }
  }
}
</script>
