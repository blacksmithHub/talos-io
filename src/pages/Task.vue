<template>
  <div>
    <SideNav />
    <v-container>
      <Header
        class="mb-3"
        @click:AddTask="openAddTaskDialog"
        @click:startTask="startTask"
        @click:editAll="editAll"
        @click:ImportTasks="importTasks"
      />
      <v-card>
        <ActionButtons
          @click:verifyAll="verifyAll"
          @click:startAll="startAll"
          @click:stopAll="stopAll"
          @click:deleteAll="deleteAll"
        />

        <v-divider />

        <v-card-text
          style="max-height: 70vh; overflow: auto"
          class="pa-0"
        >
          <Lists
            @click:startTask="startTask"
            @click:stopTask="stopTask"
            @click:deleteTask="deleteTask"
            @click:editTask="openEditTaskDialog"
            @click:checkout="redirectToCheckout"
            @click:verifyTask="verifyTask"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-row no-gutters>
            <v-col cols="6">
              <small
                style="max-width: 100%"
                class="text-capitalize text-truncate d-inline-block"
                v-text="`total: ${tasks.length}`"
              />
            </v-col>

            <v-col
              cols="6"
              class="text-right"
            >
              <small
                style="max-width: 100%"
                class="text-capitalize text-truncate d-inline-block success--text"
                v-text="`success: ${allSuccess}`"
              />
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-container>

    <TaskDialog ref="taskDialog" />
    <MassEditDialog ref="massEditDialog" />
    <ImportTaskDialog ref="importTaskDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import SideNav from '@/components/App/SideNav'
import Lists from '@/components/Tasks/Lists'
import Header from '@/components/Tasks/Header'
import TaskDialog from '@/components/Tasks/TaskDialog'
import MassEditDialog from '@/components/Tasks/MassEditDialog'
import ImportTaskDialog from '@/components/Tasks/ImportTaskDialog'
import automate from '@/mixins/magento/titan22/automate'
import Constant from '@/config/constant'
import verify from '@/mixins/magento/titan22/verify'
import ActionButtons from '@/components/Tasks/ActionButtons'
import auth from '@/services/auth'

export default {
  components: {
    SideNav,
    Lists,
    Header,
    TaskDialog,
    MassEditDialog,
    ImportTaskDialog,
    ActionButtons
  },
  mixins: [automate, verify],
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      if (!vm.attributes.length) await vm.prepareAttributes()

      if (vm.tasks.length) await vm.prepareTasks()
    })
  },
  computed: {
    ...mapState('attribute', { attributes: 'items' }),
    ...mapState('task', { tasks: 'items' }),
    ...mapState('setting', { settings: 'items' }),

    /**
     * Return success count.
     *
     */
    allSuccess () {
      return this.tasks.slice().filter((val) => val.status.class === 'success').length
    }
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    tasks () {
      ipcRenderer.send('update-tasks', this.tasks)
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })

    ipcRenderer.on('updateBanks', (event, arg) => {
      this.setBanks(arg)
    })

    ipcRenderer.on('updateProfiles', (event, arg) => {
      this.setProfiles(arg)
    })

    ipcRenderer.on('setAuth', (event, arg) => {
      auth.setAuth(JSON.stringify(arg))
    })
  },
  methods: {
    ...mapActions('attribute', {
      setAttributes: 'setItems',
      reset: 'reset'
    }),
    ...mapActions('task', {
      updateTask: 'updateItem',
      prepareTasks: 'initializeItems',
      resetTask: 'reset',
      removeTask: 'deleteItem'
    }),
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('profile', { setProfiles: 'setItems' }),
    ...mapActions('bank', { setBanks: 'setItems' }),
    ...mapActions('attribute', { prepareAttributes: 'initializeItems' }),

    /**
     * Open import task dialog.
     *
     */
    importTasks () {
      this.$refs.importTaskDialog.dialog = true
    },
    /**
     * Open mass edit dialog.
     *
     */
    editAll () {
      this.$refs.massEditDialog.dialog = true
    },
    /**
     * Open add mode.
     *
     */
    openAddTaskDialog () {
      this.$refs.taskDialog.dialog = true
    },
    /**
     * Open edit mode.
     *
     */
    openEditTaskDialog (task) {
      this.$refs.taskDialog.mapData(task)
    },
    /**
     * Redirect to checkout page.
     *
     */
    redirectToCheckout (task) {
      this.launchWindow(task.transactionData, task)
    },
    /**
     * Start task.
     *
     */
    async startTask (task) {
      if (task.status.id !== Constant.TASK.STATUS.RUNNING) {
        const logs = task.logs

        logs.push({ msg: 'started', color: 'success' })

        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.RUNNING,
            msg: 'running',
            class: 'orange'
          },
          logs: logs
        })

        await this.init(task)
      }
    },

    /**
     * delete task
     *
     */
    async deleteTask (task, key) {
      await this.stopTask(task)
      await this.removeTask(key)
    },

    /**
     * Perform on start all event.
     *
     */
    async startAll () {
      await this.tasks.forEach((task) => {
        if (task.status.class !== 'error') this.startTask(task)
      })
    },

    /**
     * Perform on stop all event.
     *
     */
    async stopAll () {
      await this.tasks.forEach((task) => this.stopTask(task))
    },
    /**
     * Stop task
     *
     */
    stopTask (task) {
      const logs = task.logs

      logs.push({ msg: 'stopped', color: 'red' })

      this.updateTask({
        ...task,
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'stopped',
          class: 'grey'
        },
        transactionData: {},
        logs: logs
      })
    },

    /**
     * Perform on delete all event.
     *
     */
    async deleteAll () {
      await this.stopAll()
      await this.resetTask()
    },

    /**
     * verify all tasks
     *
     */
    async verifyAll () {
      await this.tasks.forEach((task) => this.verifyTask(task))
    },
    /**
     * verify task
     *
     */
    async verifyTask (task) {
      if (task.status.id !== Constant.TASK.STATUS.RUNNING) {
        const logs = task.logs

        logs.push({ msg: 'verifying', color: 'cyan' })

        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.RUNNING,
            msg: 'validating',
            class: 'cyan'
          },
          transactionData: {},
          logs: logs
        })

        await this.verify(task)
      }
    }
  }
}
</script>
