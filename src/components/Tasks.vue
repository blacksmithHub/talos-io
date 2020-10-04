<template>
  <div>
    <v-container>
      <Header @click:AddTask="openAddTaskDialog" />
      <br>
      <Lists />
    </v-container>

    <TaskDialog ref="taskDialog" />
  </div>
</template>

<script>
import Lists from '@/components/Tasks/Lists'
import Header from '@/components/Tasks/Header'
import TaskDialog from '@/components/Dialogs/TaskDialog'

export default {
  components: {
    Lists,
    Header,
    TaskDialog
  },
  data () {
    return {
      //
    }
  },
  methods: {
    /**
     * Open task dialog.
     *
     */
    openAddTaskDialog () {
      this.$refs.taskDialog.dialog = true
    }
  }
}
</script>
