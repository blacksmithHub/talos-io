<template>
  <v-toolbar
    rounded
    dense
  >
    <v-row no-gutters>
      <v-col cols="6">
        <v-row
          justify="start"
          no-gutters
        >
          <v-col
            cols="3"
            class="text-center"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :fab="!$vuetify.breakpoint.lgAndUp"
                  :rounded="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  :x-small="!$vuetify.breakpoint.lgAndUp"
                  class="primary"
                  v-on="on"
                  @click="$emit('click:AddTask')"
                >
                  <v-icon
                    :left="$vuetify.breakpoint.lgAndUp"
                    v-text="'mdi-plus'"
                  />
                  <span
                    v-if="$vuetify.breakpoint.lgAndUp"
                    v-text="'add task'"
                  />
                </v-btn>
              </template>
              <span v-text="'Add new task'" />
            </v-tooltip>
          </v-col>

          <v-col
            cols="4"
            class="text-center"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :fab="!$vuetify.breakpoint.lgAndUp"
                  :rounded="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  :x-small="!$vuetify.breakpoint.lgAndUp"
                  class="primary"
                  v-on="on"
                  @click="$emit('click:ImportTasks')"
                >
                  <v-icon
                    :left="$vuetify.breakpoint.lgAndUp"
                    v-text="'mdi-playlist-plus'"
                  />
                  <span
                    v-if="$vuetify.breakpoint.lgAndUp"
                    v-text="'import tasks'"
                  />
                </v-btn>
              </template>
              <span v-text="'Import multiple tasks'" />
            </v-tooltip>
          </v-col>

          <v-col
            cols="3"
            class="text-center"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :fab="!$vuetify.breakpoint.lgAndUp"
                  :rounded="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  :x-small="!$vuetify.breakpoint.lgAndUp"
                  class="primary"
                  v-on="on"
                  @click="$emit('click:editAll')"
                >
                  <v-icon
                    :left="$vuetify.breakpoint.lgAndUp"
                    v-text="'mdi-content-duplicate'"
                  />
                  <span
                    v-if="$vuetify.breakpoint.lgAndUp"
                    v-text="'edit all'"
                  />
                </v-btn>
              </template>
              <span v-text="'Edit all tasks'" />
            </v-tooltip>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="6">
        <v-row
          justify="end"
          no-gutters
        >
          <v-col
            class="text-center"
            cols="3"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :fab="!$vuetify.breakpoint.lgAndUp"
                  :rounded="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  :x-small="!$vuetify.breakpoint.lgAndUp"
                  class="primary"
                  v-on="on"
                  @click="startAll"
                >
                  <v-icon
                    :left="$vuetify.breakpoint.lgAndUp"
                    v-text="'mdi-play'"
                  />
                  <span
                    v-if="$vuetify.breakpoint.lgAndUp"
                    v-text="'start all'"
                  />
                </v-btn>
              </template>
              <span v-text="'Start all task'" />
            </v-tooltip>
          </v-col>

          <v-col
            class="text-center"
            cols="3"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :fab="!$vuetify.breakpoint.lgAndUp"
                  :rounded="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  :x-small="!$vuetify.breakpoint.lgAndUp"
                  class="primary"
                  v-on="on"
                  @click="stopAll"
                >
                  <v-icon
                    :left="$vuetify.breakpoint.lgAndUp"
                    v-text="'mdi-stop'"
                  />
                  <span
                    v-if="$vuetify.breakpoint.lgAndUp"
                    v-text="'stop all'"
                  />
                </v-btn>
              </template>
              <span v-text="'Stop all tasks'" />
            </v-tooltip>
          </v-col>

          <v-col
            class="text-center"
            cols="3"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :fab="!$vuetify.breakpoint.lgAndUp"
                  :rounded="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  :x-small="!$vuetify.breakpoint.lgAndUp"
                  class="primary"
                  v-on="on"
                  @click="deleteAll"
                >
                  <v-icon
                    :left="$vuetify.breakpoint.lgAndUp"
                    v-text="'mdi-delete'"
                  />
                  <span
                    v-if="$vuetify.breakpoint.lgAndUp"
                    v-text="'delete all'"
                  />
                </v-btn>
              </template>
              <span v-text="'Delete all tasks'" />
            </v-tooltip>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-toolbar>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Constant from '@/config/constant'

export default {
  computed: {
    ...mapState('task', { tasks: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem', deleteTask: 'reset' }),

    /**
     * Perform on start all event.
     *
     */
    async startAll () {
      await this.tasks.forEach(async (task) => {
        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.RUNNING,
            msg: 'running',
            class: 'orange'
          },
          transactionData: {}
        })

        await this.$emit('click:startTask', task)
      })
    },

    /**
     * Perform on stop all event.
     *
     */
    async stopAll () {
      await this.tasks.forEach(async (task) => {
        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.STOPPED,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {}
        })
      })
    },

    /**
     * Perform on delete all event.
     *
     */
    async deleteAll () {
      await this.stopAll()
      await this.deleteTask()
    }
  }
}
</script>
