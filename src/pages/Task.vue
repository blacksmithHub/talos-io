<template>
  <div>
    <SideNav />
    <div class="pa-5">
      <Header
        class="mb-3"
        @click:AddTask="openAddTaskDialog"
        @click:startTask="startTask"
        @click:editAll="editAll"
        @click:ImportTasks="importTasks"
      />
      <v-card>
        <TaskTitle
          style="border-bottom: 1px solid #d85820"
          @click:verifyAll="verifyAll"
          @click:startAll="startAll"
          @click:stopAll="stopAll"
          @click:deleteAll="deleteAll"
          @input:search="onSearch"
        />

        <v-divider />

        <v-card-text
          style="max-height: 65vh; overflow: auto"
          class="pa-0"
        >
          <Lists
            ref="list"
            @click:startTask="startTask"
            @click:stopTask="stopTask"
            @click:deleteTask="deleteTask"
            @click:editTask="openEditTaskDialog"
            @click:checkout="redirectToCheckout"
            @click:verifyTask="verifyTask"
            @click:duplicateTask="duplicateTask"
            @click:openLogs="openLogs"
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
    </div>

    <LogsDialog ref="logsDialog" />
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
import LogsDialog from '@/components/Tasks/LogsDialog'
import TaskTitle from '@/components/Tasks/TaskTitle'

import automate from '@/mixins/magento/titan22/automate'
import verify from '@/mixins/magento/titan22/verify'

import Constant from '@/config/constant'

export default {
  components: {
    TaskTitle,
    LogsDialog,
    SideNav,
    Lists,
    Header,
    TaskDialog,
    MassEditDialog,
    ImportTaskDialog
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
      try {
        ipcRenderer.send('update-tasks', this.tasks)
      } catch (error) {
        //
      }
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })

    ipcRenderer.on('updateBanks', (event, arg) => {
      this.setBanks(arg)
      this.updateAllBankTask(arg)
    })

    ipcRenderer.on('updateProfiles', (event, arg) => {
      this.setProfiles(arg)
      this.updateAllProfileTask(arg)
    })

    ipcRenderer.on('updateTask', (event, arg) => {
      this.updateTask({
        ...this.tasks.find((val) => val.id === arg.id),
        paid: true
      })
    })

    ipcRenderer.on('updateProxies', (event, arg) => {
      this.setProxies(arg)
      this.updateAllProxyTask(arg)
    })
  },
  methods: {
    ...mapActions('attribute', {
      setAttributes: 'setItems',
      reset: 'reset'
    }),
    ...mapActions('task', {
      addTask: 'addItem',
      updateTask: 'updateItem',
      prepareTasks: 'initializeItems',
      resetTask: 'reset',
      removeTask: 'deleteItem'
    }),
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('profile', { setProfiles: 'setItems' }),
    ...mapActions('bank', { setBanks: 'setItems' }),
    ...mapActions('proxy', { setProxies: 'setItems' }),
    ...mapActions('attribute', { prepareAttributes: 'initializeItems' }),

    /**
     * update all proxy tasks
     */
    updateAllProxyTask (proxies) {
      this.tasks.forEach(element => {
        const proxy = proxies.find((val) => val.id === element.proxy.id)

        if (proxy) {
          this.updateTask({
            ...element,
            proxy: proxy
          })
        }
      })
    },
    /**
     * update all bank tasks
     */
    updateAllBankTask (banks) {
      this.tasks.forEach(element => {
        const bank = banks.find((val) => val.id === element.bank.id)

        if (bank) {
          this.updateTask({
            ...element,
            bank: bank
          })
        }
      })
    },
    /**
     * update all profile tasks
     */
    updateAllProfileTask (profiles) {
      this.tasks.forEach(element => {
        const profile = profiles.find((val) => val.id === element.profile.id)

        if (profile) {
          this.updateTask({
            ...element,
            profile: profile
          })
        }
      })
    },
    /**
     * on search input event.
     */
    onSearch (search) {
      this.$refs.list.search = search
    },
    /**
     * Open logs dialog.
     *
     */
    openLogs (task) {
      this.$refs.logsDialog.mapData(task)
    },
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
     * Duplicate task event
     */
    duplicateTask (task) {
      const duplicate = { ...task }

      delete duplicate.id

      this.addTask(duplicate)
    },
    /**
     * Redirect to checkout page.
     *
     */
    redirectToCheckout (task) {
      switch (task.transactionData.method) {
        case 'PayMaya':
          ipcRenderer.send('pay-with-paymaya', JSON.stringify({ task: task, settings: this.settings }))
          break

        case '2c2p':
          ipcRenderer.send('pay-with-2c2p', JSON.stringify({ task: task, settings: this.settings }))
          break
      }
    },
    /**
     * Start task.
     *
     */
    async startTask (task) {
      if (task.status.id !== Constant.TASK.STATUS.RUNNING) {
        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.RUNNING,
            msg: 'running',
            class: 'orange'
          },
          logs: `${task.logs || ''};Started!`,
          paid: false
        })

        await this.init(task)
      }
    },
    /**
     * delete task
     *
     */
    async deleteTask (task) {
      await this.stopTask(task)
      await this.removeTask(task.id)
    },

    /**
     * Perform on start all event.
     *
     */
    async startAll () {
      if (this.$refs.list.selected.length) {
        await this.$refs.list.selected.forEach((task) => {
          if (task.status.class !== 'error') this.startTask(task)
        })
      } else {
        await this.tasks.forEach((task) => {
          if (task.status.class !== 'error') this.startTask(task)
        })
      }
    },

    /**
     * Perform on stop all event.
     *
     */
    async stopAll () {
      if (this.$refs.list.selected.length) {
        await this.$refs.list.selected.forEach((task) => this.stopTask(task))
      } else {
        await this.tasks.forEach((task) => this.stopTask(task))
      }
    },
    /**
     * Stop task
     *
     */
    stopTask (task) {
      try {
        task.cancelTokenSource.cancel()
      } catch (error) {
        //
      }

      this.updateTask({
        ...task,
        status: {
          id: Constant.TASK.STATUS.STOPPED,
          msg: 'stopped',
          class: 'grey'
        },
        transactionData: {},
        paid: false,
        logs: `${task.logs || ''};Stopped!`
      })
    },

    /**
     * Perform on delete all event.
     *
     */
    async deleteAll () {
      if (this.$refs.list.selected.length) {
        await this.$refs.list.selected.forEach((task) => {
          this.stopTask(task)
          this.deleteTask(task)
        })
      } else {
        await this.stopAll()
        await this.resetTask()
      }
    },

    /**
     * verify all tasks
     *
     */
    async verifyAll () {
      if (this.$refs.list.selected.length) {
        await this.$refs.list.selected.forEach((task) => this.verifyTask(task))
      } else {
        await this.tasks.forEach((task) => this.verifyTask(task))
      }
    },
    /**
     * verify task
     *
     */
    async verifyTask (task) {
      if (task.status.id !== Constant.TASK.STATUS.RUNNING) {
        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.RUNNING,
            msg: 'validating',
            class: 'cyan'
          },
          transactionData: {},
          paid: false
        })

        await this.verify(task)
      }
    }
  }
}
</script>
