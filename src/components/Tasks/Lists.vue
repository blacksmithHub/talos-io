<template>
  <v-list
    v-if="tasks.length"
    class="pa-0"
  >
    <template v-for="(task, index) in tasks">
      <v-list-item
        :key="`${index}-item`"
        class="pa-0"
        :class="`${task.status.class}-left-border`"
      >
        <v-list-item-content class="pa-2">
          <v-row no-gutters>
            <v-col
              cols="4"
              md="8"
              align-self="center"
              class="task"
              :class="{'teal--text': task.aco, 'success--text': task.paid}"
              @click="(task.status.class === 'error') ? '' : $emit('click:editTask', task)"
            >
              <v-row
                align="center"
                no-gutters
              >
                <v-col
                  cols="12"
                  align-self="center"
                >
                  <h4
                    class="d-inline-block text-truncate"
                    style="max-width: 15vh"
                    v-text="`${task.name}`"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                  align-self="center"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 14vh"
                  >
                    <strong
                      class="mr-1"
                      v-text="'Profile:'"
                    />
                    <span v-text="`${task.profile.name}`" />
                  </small>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                  align-self="center"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 14vh"
                  >
                    <strong
                      class="mr-1"
                      v-text="'Bank:'"
                    />
                    <span v-text="`${task.bank.nickname || 'N/A'}`" />
                  </small>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                  align-self="center"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 14vh"
                  >
                    <strong
                      class="mr-1"
                      v-text="'SKU:'"
                    />
                    <span v-text="`${task.sku}`" />
                  </small>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                  align-self="center"
                >
                  <small
                    class="d-inline-block text-truncate"
                    style="max-width: 14vh"
                  >
                    <strong
                      class="mr-1"
                      v-text="'Sizes:'"
                    />
                    <span v-text="`${getSizes(task.sizes)}`" />
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
              <p
                v-if="task.delay"
                class="mb-1"
              >
                <v-icon
                  left
                  x-small
                  v-text="'mdi-timelapse'"
                />
                <small
                  class="text-capitalize"
                  v-text="`${task.delay}ms`"
                />
              </p>

              <v-chip
                v-if="task.status.class === 'success' && task.aco"
                v-clipboard:copy="task.transactionData.cookies.value"
                v-clipboard:success="onCopy"
                outlined
                small
                color="success"
                class="text-capitalize cursor"
                v-text="'copy checkout cookie!'"
              />

              <v-chip
                v-else-if="task.status.class === 'success' && !settings.autoPay"
                outlined
                small
                color="success"
                class="text-capitalize"
                @click="$emit('click:checkout', task)"
                v-text="'proceed to checkout!'"
              />

              <v-chip
                v-else
                outlined
                small
                :color="task.status.class"
                class="text-capitalize"
                v-text="task.status.msg"
              />

              <p
                v-if="task.placeOrder"
                class="mb-0 mt-1"
              >
                <v-icon
                  left
                  x-small
                  v-text="'mdi-alarm-check'"
                />
                <small v-text="$moment(`${$moment().format('YYYY/MM/DD')} ${task.placeOrder}`).format('h:mm:ss a')" />
              </p>
            </v-col>

            <v-col
              align-self="center"
              cols="5"
              md="2"
              class="text-right"
            >
              <v-btn
                icon
                color="primary"
                @click="$emit('click:verifyTask', task)"
              >
                <v-icon v-text="'mdi-shield-search'" />
              </v-btn>

              <v-btn
                v-if="task.status.class !== 'error'"
                icon
                color="primary"
                @click="$emit('click:startTask', task)"
              >
                <v-icon v-text="'mdi-play'" />
              </v-btn>

              <v-btn
                icon
                color="primary"
                @click="$emit('click:stopTask', task)"
              >
                <v-icon v-text="'mdi-stop'" />
              </v-btn>

              <v-btn
                icon
                color="primary"
                @click="$emit('click:deleteTask', task, index)"
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
    <v-list-item class="pa-0">
      <v-list-item-content class="pa-2 text-center">
        <small v-text="'Nothing to display'" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  methods: {
    /**
     *  On copy event.
     *
     */
    onCopy () {
      this.$toast.open({
        message: '<strong style="font-family: Arial; text-transform: uppercase">you just copied a cookie</strong>',
        type: 'info',
        duration: 3000,
        position: 'bottom-left'
      })
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
  border-left: 3px solid orange
}
.grey-left-border {
  border-left: 3px solid grey
}
.error-left-border {
  border-left: 3px solid red
}
.success-left-border {
  border-left: 3px solid green
}
.cyan-left-border {
  border-left: 3px solid cyan
}
.light-blue-left-border {
  border-left: 3px solid lightblue
}

.task:hover {
  cursor: pointer;
}
</style>
