<template>
  <v-list>
    <template v-for="(task, index) in tasks">
      <v-list-item
        :key="task.title"
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
              @click="$emit('click:selectList', task)"
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
                    <span v-text="task.sizes" />
                  </small>
                </v-col>
              </v-row>
            </v-col>

            <v-col
              align-self="center"
              class="text-center task"
              cols="3"
              md="2"
              @click="$emit('click:selectList', task)"
            >
              <v-chip
                v-if="task.status.msg"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                outlined
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
        :key="index"
      />
    </template>
  </v-list>
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
    ...mapActions('task', { updateTask: 'updateItem', deleteTask: 'deleteItem' }),

    /**
     * Perform on start event.
     *
     */
    async onStart (task) {
      this.updateTask({
        id: task.id,
        status: {
          id: Constant.TASK.STATUS.RUNNING,
          msg: 'running',
          class: 'orange'
        }
      })

      await this.$emit('click:startTask', task)
    },

    /**
     * Perform on stop event.
     *
     */
    async onStop (task) {
      await this.updateTask({
        id: task.id,
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'stopped',
          class: 'grey'
        }
      })
    },

    /**
     * Perform on delete event.
     *
     */
    async onDelete (task, key) {
      await this.onStop(task)

      this.deleteTask(key)
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
.list:hover {
  background-color: whitesmoke;
}
</style>
