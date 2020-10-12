<template>
  <div>
    <v-container>
      <Header
        @click:AddTask="openAddTaskDialog"
        @click:startTask="startTask"
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
  </div>
</template>

<script>
import { mapState } from 'vuex'

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
  computed: {
    ...mapState('setting', { settings: 'items' })
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
      const response = await this.init(task)

      const currentTask = this.allTasks.find((data) => data.id === task.id)

      if (response && (currentTask && currentTask.status.id === Constant.TASK.STATUS.RUNNING)) {
        this.updateTask({
          ...task,
          status: {
            id: Constant.TASK.STATUS.STOPPED,
            msg: 'copped!',
            class: 'success'
          },
          transactionData: response
        })

        if (this.settings.sound) {
          var audio = new Audio(require('@/assets/success.mp3'))
          audio.play()
        }

        this.$toast.open({
          message: '<strong style="font-family: Arial; text-transform: uppercase">checked out</strong>',
          type: 'success',
          duration: 3000
        })

        if (this.settings.webhook) this.webhook(response, task)

        if (this.settings.autoPay) this.launchWindow(response)
      }
    },
    /**
     * Send discord webhook.
     *
     */
    webhook (data, task) {
      const purchased = data.order.totals.items[0]

      const webhook = require('webhook-discord')

      const Hook = new webhook.Webhook(this.settings.webhook)

      const msg = new webhook.MessageBuilder()
        .setAvatar('https://neilpatel.com/wp-content/uploads/2019/08/google.jpg')
        .setFooter('this is a footer', 'https://neilpatel.com/wp-content/uploads/2019/08/google.jpg')
        .setTime()
        .setName('Titan Bot')
        .setColor('#008000')
        .setTitle('Copped!')
        .setDescription(`
          **Product:** ${purchased.name}\n
          **Size:** ${JSON.parse(purchased.options)[0].value}\n
          **Task:** ${task.name}\n
          **Checkout Time:** ${data.time} secs
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

      let win = new BrowserWindow({
        width: 800,
        height: 600
      })

      win.removeMenu()

      const ses = win.webContents.session

      ses.cookies.set({
        url: baseUrl,
        ...transactionData.cookies
      })
        .then((response) => {
          win.loadURL(baseUrl)

          win.on('closed', () => {
            win = null
          })
        })
    }
  }
}
</script>
