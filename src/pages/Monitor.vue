<template>
  <h1>Hello World</h1>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data () {
    return {
      running: false
    }
  },
  created () {
    ipcRenderer.on('init', (event, arg) => {
      if (arg) {
        this.running = true
        this.init()
      }
    })

    ipcRenderer.on('stop', (event, arg) => {
      if (arg) this.stop()
    })
  },
  methods: {
    init () {
      setInterval(() => (console.log('hello world')), 3000)
    },
    stop () {
      this.running = false
    }
  }
}
</script>
