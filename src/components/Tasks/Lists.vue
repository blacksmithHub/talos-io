<template>
  <div>
    <v-btn @click="startAll">
      start all
    </v-btn>

    <v-list dense>
      <template v-for="(task, index) in tasks">
        <v-list-item
          :key="task.title"
          class="pa-0"
          :class="status(task.status)"
        >
          <!-- active -->
          <template v-slot:default="{ }">
            <v-list-item-content class="pa-1">
              <v-row no-gutters>
                <v-col>
                  <v-row no-gutters>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <h4 v-text="task.name" />
                    </v-col>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <small>
                        <strong
                          class="mr-1"
                          v-text="'Email:'"
                        />
                        <span v-text="task.email" />
                      </small>
                    </v-col>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <v-chip
                        v-if="task.msg"
                        x-small
                        outlined
                        color="error"
                        v-text="task.msg"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <v-col
                  cols="4"
                  class="text-right"
                >
                  <v-btn
                    icon
                    @click="onStart(index, task)"
                  >
                    <v-icon v-text="'mdi-play'" />
                  </v-btn>

                  <v-btn
                    icon
                    @click="onStop(index, task)"
                  >
                    <v-icon v-text="'mdi-stop'" />
                  </v-btn>

                  <v-btn
                    icon
                    @click="onDelete(index)"
                  >
                    <v-icon v-text="'mdi-delete'" />
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item-content>
          </template>
        </v-list-item>

        <v-divider
          v-if="index < tasks.length - 1"
          :key="index"
        />
      </template>
    </v-list>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import automate from '@/services/magento/titan22/automate'

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
    ...mapActions('task', ['updateItem']),

    /**
     * Perform on start event.
     *
     */
    onStart (key, task) {
      task.status = 2

      automate.init(task)
    },

    /**
     * Perform on stop event.
     *
     */
    onStop (key, task) {
      task.status = 1

      automate.init(task)
    },

    /**
     * Perform on start all event.
     *
     */
    startAll () {
      this.tasks.forEach((task, key) => {
        task.status = 2

        automate.init(task)
      })
    },

    /**
     * Return status.
     *
     */
    status (id) {
      switch (id) {
        case 1:
          return 'stopped'
        case 2:
          return 'running'
        case 3:
          return 'error'
      }
    }
  }
}
</script>

<style scoped>
.running {
  border-left: 2px solid orange
}
.stopped {
  border-left: 2px solid grey
}
.error {
  border-left: 2px solid red
}
</style>
