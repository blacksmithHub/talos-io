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
import Config from '@/config/app'

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

      if (Object.keys(response).length) {
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

        this.webhook(response.order, task)
        this.launchWindow(response)
      }
    },
    /**
     * Send discord webhook.
     *
     */
    webhook (order, task) {
      const purchased = order.totals.items[0]

      const webhook = require('webhook-discord')

      const Hook = new webhook.Webhook('https://discordapp.com/api/webhooks/763724814816903179/6zuiu0wIgm8-cwR4H-qvgEIg421Zlo2lHaaBb-8gBdzwW_J7Z-5C2LGBAk7wDFTI_KsO')

      const msg = new webhook.MessageBuilder()
        .setAvatar('https://neilpatel.com/wp-content/uploads/2019/08/google.jpg')
        .setFooter('this is a footer', 'https://neilpatel.com/wp-content/uploads/2019/08/google.jpg')
        .setTime()
        .setName('Baitlog')
        .setColor('#008000')
        .setTitle('Copped!')
        .setDescription(`
          **Product:** ${purchased.name}\n
          **Size:** ${JSON.parse(purchased.options)[0].value}\n
          **Task:** ${task.name}
        `)

      Hook.send(msg)
    },
    /**
     * Launch the payment window.
     *
     */
    launchWindow (transactionData) {
      const electron = require('electron')
      const { BrowserWindow } = electron.remote

      const baseUrl = `${Config.services.titan22.checkout}/RedirectV3/Payment/Accept`

      const win = new BrowserWindow({
        width: 800,
        height: 600
      })

      const ses = win.webContents.session

      ses.cookies.set({
        url: baseUrl,
        ...transactionData.cookies
      })
        .then((response) => {
          win.loadURL(baseUrl)
          win.webContents.openDevTools()
        })
    }
  }
}
</script>
