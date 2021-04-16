<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600px"
  >
    <v-card>
      <v-card-title style="border-bottom:1px solid #d85820">
        <span
          class="headline primary--text"
          v-text="`Logs`"
        />

        <v-spacer />

        <v-btn
          icon
          class="primary--text"
          @click="onClose"
        >
          <v-icon v-text="'mdi-close'" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-3">
        <v-card
          flat
          height="200"
          style="overflow-y: auto !important"
          width="100%"
          class="black"
        >
          <ul style="list-style-type: none; padding: 0px; margin: 0px">
            <li
              v-for="(log, index) in logs"
              :id="`log-${index}`"
              :key="index"
            >
              {{ log }}
            </li>
          </ul>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-container class="text-right">
          <v-btn
            rounded
            depressed
            small
            outlined
            color="primary"
            @click="exportLogs"
            v-text="'Export'"
          />
        </v-container>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import fs from 'fs'
import base64 from 'base-64'
import electron from 'electron'

export default {
  data () {
    return {
      dialog: false,
      logs: []
    }
  },
  watch: {
    dialog () {
      if (this.dialog) {
        setTimeout(() => {
          if (this.logs.length) document.getElementById(`log-${this.logs.length - 1}`).scrollIntoView()
        }, 500)
      }
    }
  },
  methods: {
    async launch (id) {
      const data = await fs.readFileSync(`Task-${id}.json`, 'utf8')
      this.logs = JSON.parse(base64.decode(data))
      this.dialog = true
    },
    exportLogs () {
      const text = this.logs.join('\n')

      const dialog = electron.remote.dialog

      dialog.showSaveDialog({
        title: 'Export Logs',
        buttonLabel: 'Export',
        filters: [
          {
            name: 'Text Files',
            extensions: ['txt']
          }
        ],
        properties: []
      })
        .then(file => {
          if (!file.canceled) {
            fs.writeFile(file.filePath.toString(), text, (err) => {
              if (err) throw err

              this.showSnackbar({ message: 'Exported successfully', color: 'teal' })
            })
          }
        })
    },
    onClose () {
      this.logs = []
      this.dialog = false
    }
  }
}
</script>
