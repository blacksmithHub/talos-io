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

import TaskDialog from '@/components/Tasks/TaskDialog.vue'

import File from '@/mixins/file'

export default {
  components: {
    TaskDialog
  },
  mixins: [File],
  props: {
    search: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' })
  },
  methods: {
    ...mapActions('task', ['addItem']),

    async importData () {
      const data = await this.importJson('Import Tasks')

      if (data && data.length) {
        data.forEach((el) => {
          delete el.id
          this.addItem(el)
        })
      }
    }
  }
}
</script>
