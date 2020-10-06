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
          <v-col cols="3">
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
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
          </v-col>

          <v-col cols="3">
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
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
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="6">
        <v-row
          justify="end"
          no-gutters
        >
          <v-col
            class="text-right"
            cols="3"
          >
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
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
          </v-col>

          <v-col
            class="text-right"
            cols="3"
          >
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
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
          </v-col>

          <v-col
            class="text-right"
            cols="3"
          >
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
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
  data () {
    return {
      //
    }
  },
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
          id: task.id,
          status: {
            id: Constant.TASK.STATUS.RUNNING,
            msg: 'running',
            class: 'orange'
          }
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
          id: task.id,
          status: {
            id: Constant.TASK.STATUS.STOPPED,
            msg: 'stopped',
            class: 'grey'
          }
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
