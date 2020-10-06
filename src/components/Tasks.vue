<template>
  <div>
    <v-container>
      <Header
        @click:AddTask="openAddTaskDialog"
        @click:startTask="startTask"
      />
      <br>
      <Lists
        @click:selectList="openEditTaskDialog"
        @click:startTask="startTask"
      />
    </v-container>

    <TaskDialog
      ref="taskDialog"
      :task="selectedTask"
    />
  </div>
</template>

<script>
import Lists from '@/components/Tasks/Lists'
import Header from '@/components/Tasks/Header'
import TaskDialog from '@/components/Dialogs/TaskDialog'
import Constant from '@/config/constant'
import automate from '@/mixins/magento/titan22/automate'

export default {
  components: {
    Lists,
    Header,
    TaskDialog
  },
  mixins: [automate],
  data () {
    return {
      selectedTask: {}
    }
  },
  methods: {
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
      if (task.status.id === Constant.TASK.STATUS.STOPPED) {
        this.selectedTask = task
        this.$refs.taskDialog.dialog = true
      }
    },
    /**
     * Start task.
     *
     */
    async startTask (task) {
      const response = await this.init(task)

      if (response) {
        this.updateTask({
          id: task.id,
          status: {
            id: Constant.TASK.STATUS.STOPPED,
            msg: 'copped!',
            class: 'success'
          }
        })

        this.$toast.open({
          message: '<strong style="font-family: Arial; text-transform: uppercase">checked out</strong>',
          type: 'success',
          duration: 3000
        })
      }
    }
  }
}
</script>
