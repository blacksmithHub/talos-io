<template>
  <div>
    <v-container>
      <Header @click:AddTask="openAddTaskDialog" />
      <br>
      <Lists @click:selectList="openEditTaskDialog" />
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

export default {
  components: {
    Lists,
    Header,
    TaskDialog
  },
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
    }
  }
}
</script>
