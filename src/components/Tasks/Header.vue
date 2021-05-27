<template>
  <div>
    <v-row
      align="center"
      justify="center"
      class="pa-3"
    >
      <v-col
        cols="5"
        align-self="center"
      >
        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="$refs.taskDialog.dialog = true"
        >
          <v-icon
            left
            v-text="'mdi-plus'"
          />
          <span v-text="'create task'" />
        </v-btn>

        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="importData"
        >
          <v-icon
            left
            v-text="'mdi-upload'"
          />
          <span v-text="'import'" />
        </v-btn>

        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          @click="exportJson(tasks, 'Export Tasks To JSON')"
        >
          <v-icon
            left
            v-text="'mdi-download'"
          />
          <span v-text="'export'" />
        </v-btn>
      </v-col>

      <v-col
        cols="5"
        align-self="center"
      >
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          hide-details
          outlined
          dense
        />
      </v-col>

      <v-col
        cols="2"
        align-self="center"
        class="text-right"
      >
        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          @click="launchMonitor"
        >
          <v-icon
            left
            v-text="'mdi-monitor'"
          />
          <span v-text="'Monitor'" />
        </v-btn>
      </v-col>
    </v-row>

    <TaskDialog ref="taskDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import TaskDialog from '@/components/Tasks/TaskDialog.vue'

import File from '@/mixins/file'
import ProxyDistribution from '@/mixins/proxy-distribution'

export default {
  components: {
    TaskDialog
  },
  mixins: [File, ProxyDistribution],
  props: {
    search: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('proxy', { proxies: 'items' })
  },
  methods: {
    ...mapActions('task', ['addItem', 'setItems']),

    async importData () {
      const data = await this.importJson('Import Tasks')

      if (data && data.length) {
        const localhost = this.proxies.find((el) => el.id === 1)

        for (let index = 0; index < data.length; index++) {
          await delete data[index].id

          const newTask = await this.addItem(data[index])

          const modifiedTasks = await this.setProxyConfigs(this.tasks, newTask, localhost)
          await this.setItems(modifiedTasks)
        }
      }
    },

    launchMonitor () {
      ipcRenderer.send('launch-monitor')
    }
  }
}
</script>
