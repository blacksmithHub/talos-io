<template>
  <div>
    <v-container>
      <Header
        @click:AddTask="openAddTaskDialog"
        @click:startTask="startTask"
        @click:editAll="editAll"
        @click:ImportTasks="importTasks"
      />
      <br>
      <v-card>
        <v-card-text style="max-height: 80vh; overflow: auto;">
          <Lists
            @click:startTask="startTask"
            @click:editTask="openEditTaskDialog"
            @click:checkout="redirectToCheckout"
          />
        </v-card-text>
      </v-card>
    </v-container>

    <TaskDialog
      ref="taskDialog"
      :task="selectedTask"
    />
    <MassEditDialog ref="massEditDialog" />
    <ImportTaskDialog ref="importTaskDialog" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Lists from '@/components/Tasks/Lists'
import Header from '@/components/Tasks/Header'
import TaskDialog from '@/components/Dialogs/TaskDialog'
import MassEditDialog from '@/components/Dialogs/MassEditDialog'
import ImportTaskDialog from '@/components/Dialogs/ImportTaskDialog'
import automate from '@/mixins/magento/titan22/automate'

export default {
  components: {
    Lists,
    Header,
    TaskDialog,
    MassEditDialog,
    ImportTaskDialog
  },
  mixins: [automate],
  data () {
    return {
      selectedTask: {}
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' })
  },
  methods: {
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
      this.selectedTask = task
      this.$refs.taskDialog.dialog = true
    },
    /**
     * Redirect to checkout page.
     *
     */
    redirectToCheckout (task) {
      this.launchWindow(task.transactionData)
    },
    /**
     * Start task.
     *
     */
    async startTask (task) {
      await this.init(task)
    }
  }
}
</script>
