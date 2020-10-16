<template>
  <v-list
    v-if="tasks.length"
    class="pa-0"
  >
    <template v-for="(task, index) in tasks">
      <v-list-item
        :key="`${index}-item`"
        class="pa-0 list"
        :class="`${task.status.class}-left-border`"
      >
        <v-list-item-content class="pa-2">
          <v-row no-gutters>
            <v-col
              cols="5"
              md="8"
              align-self="center"
              class="task"
              @click="$emit('click:editTask', task)"
            >
              <v-row no-gutters>
                <v-col
                  cols="12"
                  md="3"
                >
                  <h4 v-text="task.name" />
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 100%"
                  >
                    <strong
                      class="mr-1"
                      v-text="'Email:'"
                    />
                    <span v-text="task.email" />
                  </small>
                </v-col>

                <v-col
                  cols="12"
                  md="2"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 100%"
                  >
                    <strong
                      class="mr-1"
                      v-text="'SKU:'"
                    />
                    <span v-text="task.sku" />
                  </small>
                </v-col>

                <v-col
                  cols="12"
                  md="2"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 100%"
                  >
                    <strong
                      class="mr-1"
                      v-text="'Sizes:'"
                    />
                    <span v-text="getSizes(task.sizes)" />
                  </small>
                </v-col>
              </v-row>
            </v-col>

            <v-col
              align-self="center"
              class="text-center"
              cols="3"
              md="2"
            >
              <v-chip
                v-if="task.status.class === 'success' && !settings.autoPay"
                outlined
                small
                color="success"
                class="text-capitalize"
                @click="$emit('click:checkout', task)"
                v-text="'click me!'"
              />
              <v-chip
                v-else
                outlined
                small
                :color="task.status.class"
                class="text-capitalize"
                v-text="task.status.msg"
              />
            </v-col>

            <v-col
              align-self="center"
              cols="4"
              md="2"
              class="text-right"
            >
              <v-btn
                icon
                color="primary"
                @click="onStart(task)"
              >
                <v-icon v-text="'mdi-play'" />
              </v-btn>

              <v-btn
                icon
                color="primary"
                @click="onStop(task)"
              >
                <v-icon v-text="'mdi-stop'" />
              </v-btn>

              <v-btn
                icon
                color="primary"
                @click="onDelete(task, index)"
              >
                <v-icon v-text="'mdi-delete'" />
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item-content>
      </v-list-item>

      <v-divider
        v-if="index < tasks.length - 1"
        :key="`${index}-divider`"
      />
    </template>
  </v-list>

  <v-list v-else>
    <v-list-item class="pa-0 list">
      <v-list-item-content class="pa-2 text-center">
        <small v-text="'No task found'" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Constant from '@/config/constant'

export default {
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem', deleteTask: 'deleteItem' }),

    /**
     * Perform on start event.
     *
     */
    async onStart (task) {
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
    },

    /**
     * Perform on stop event.
     *
     */
    async onStop (task) {
      await this.updateTask({
        ...task,
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'stopped',
          class: 'grey'
        },
        transactionData: {}
      })
    },

    /**
     * Perform on delete event.
     *
     */
    async onDelete (task, key) {
      await this.onStop(task)

      this.deleteTask(key)
    },

    /**
     * Return sizes.
     *
     */
    getSizes (sizes) {
      const list = []

      sizes.forEach(element => {
        list.push(element.label)
      })

      return list.join(' | ')
    }
  }
}
</script>

<style scoped>
.orange-left-border {
  border-left: 5px solid orange
}
.grey-left-border {
  border-left: 5px solid grey
}
.error-left-border {
  border-left: 5px solid red
}
.success-left-border {
  border-left: 5px solid green
}

.task:hover {
  cursor: pointer;
}
</style>
