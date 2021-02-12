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
          v-text="`${header}`"
        />

        <v-spacer />

        <v-btn
          icon
          class="primary--text"
          @click="dialog=false"
        >
          <v-icon v-text="'mdi-close'" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text style="height: 30vh; max-height: 30vh; overflow-y: auto;">
        <ul v-if="logs.length">
          <li
            v-for="(log, index) in logs"
            :id="`log-${index}`"
            :key="index"
          >
            {{ log }}
          </li>
        </ul>

        <p
          v-else
          class="text-center mt-10"
        >
          Nothing to display
        </p>
      </v-card-text>

      <v-card-actions class="justify-center pa-5">
        <v-btn
          class="primary"
          rounded
          depressed
          small
          @click="download"
        >
          <v-icon
            left
            small
            v-text="'mdi-download'"
          />
          Download
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      task: {}
    }
  },
  computed: {
    logs () {
      return (this.task.logs) ? this.task.logs.split(';') : []
    },
    header () {
      return (Object.keys(this.task).length) ? `${this.task.profile.name} - Logs` : 'Logs'
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
    mapData (task) {
      this.dialog = true
      this.task = task
    },
    download () {
      var FileSaver = require('file-saver')
      var blob = new Blob([this.logs.join('\n')], { type: 'text/plain;charset=utf-8' })
      FileSaver.saveAs(blob, `${this.header}.txt`)
    }
  }
}
</script>
