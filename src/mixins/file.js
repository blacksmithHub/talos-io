import { mapActions } from 'vuex'

import base64 from 'base-64'
import utf8 from 'utf8'
import electron from 'electron'
import fs from 'fs'

export default {
  methods: {
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * Export data to json file
     */
    exportJson (data, title) {
      const text = JSON.stringify(data)
      const bytes = utf8.encode(text)
      const encoded = base64.encode(bytes)

      const dialog = electron.remote.dialog

      dialog.showSaveDialog({
        title: title,
        buttonLabel: 'Export',
        filters: [
          {
            name: 'JSON',
            extensions: ['json']
          }
        ],
        properties: []
      })
        .then(file => {
          if (!file.canceled) {
            fs.writeFile(file.filePath.toString(), encoded, (err) => {
              if (err) throw err

              this.showSnackbar({ message: 'Exported successfully', color: 'teal' })
            })
          }
        })
    },
    /**
     * Import json file
     */
    async importJson (title) {
      const dialog = electron.remote.dialog

      return dialog.showOpenDialog({
        title: title,
        buttonLabel: 'Import',
        filters: [
          {
            name: 'JSON',
            extensions: ['json']
          }
        ],
        properties: []
      })
        .then(async (result) => {
          if (!result.filePaths.length) return null

          const data = await fs.readFileSync(result.filePaths[0].toString(), 'utf8')

          this.showSnackbar({ message: 'Imported successfully', color: 'teal' })

          return JSON.parse(base64.decode(data))
        })
    }
  }
}
