<template>
  <div>
    <v-layout
      v-resize="onResize"
      fluid
    >
      <v-data-table
        v-model="selected"
        :height="windowSize.y - 73 - 33 - 69 - 45"
        style="width: 100%"
        class="elevation-2"
        no-data-text="Nothing to display"
        no-results-text="Nothing to display"
        :headers="headers"
        :items="tasks"
        item-key="id"
        show-select
        hide-default-footer
        :items-per-page="tasks.length"
        fixed-header
        disable-pagination
        :search="search"
      >
        <template v-slot:top>
          <Header :search="search" />
          <v-divider style="border:1px solid #d85820" />
        </template>

        <template v-slot:footer>
          <v-divider style="border:1px solid #d85820" />
          <Footer
            :selected="selected"
            @click:start="onStart"
            @click:stop="onStop"
            @click:delete="onDelete"
            @click:init="onInit"
          />
        </template>

        <template v-slot:[`item.account.name`]="{ item }">
          <span>
            <div
              class="row cursor"
              style="width: 120px"
            >
              <div
                class="col-12 text-truncate"
                :class="{'success--text': item.paid}"
                v-text="item.account.name"
              />
            </div>

            <small v-text="`Mode: ${item.mode.label}`" />
          </span>
        </template>

        <template v-slot:[`item.billing.name`]="{ item }">
          <span>
            <div
              class="row cursor"
              style="width: 120px"
            >
              <div
                class="col-12 text-truncate"
                :class="{'success--text': item.paid}"
                v-text="(item.billing) ? item.billing.name : 'none'"
              />
            </div>

            <small v-text="`Method: ${item.checkoutMethod.label}`" />
          </span>
        </template>

        <template v-slot:[`item.proxy.name`]="{ item }">
          <span>
            <div
              class="row cursor"
              style="width: 120px"
            >
              <div
                class="col-12 text-truncate"
                :class="{'success--text': item.paid}"
                v-text="(item.proxy) ? item.proxy.name : 'Localhost'"
              />
            </div>

            <small v-text="`Count: ${(item.proxy) ? item.proxy.configs.length : 1} IP${(item.proxy && item.proxy.configs.length > 1) ? 's' : ''}`" />
          </span>
        </template>

        <template v-slot:item.sku="{ item }">
          <span>
            <div
              class="row cursor"
              style="width: 115px"
            >
              <div
                class="col-12 text-truncate"
                :class="{'success--text': item.paid}"
                v-text="item.sku"
              />
            </div>

            <small v-text="`Quantity: ${item.qty}`" />
          </span>
        </template>

        <template v-slot:item.sizes="{ item }">
          <div
            class="row cursor"
            style="width: 90px"
          >
            <div
              class="col-12 text-truncate"
              :class="{'success--text': item.paid}"
              v-text="getSizes(item)"
            />
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <Status :item="item" />
        </template>

        <template v-slot:item.actions="{item}">
          <Action
            :item="item"
            @click:start="onStart"
            @click:stop="onStop"
            @click:delete="onDelete"
            @click:init="onInit"
          />
        </template>
      </v-data-table>
    </v-layout>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Header from '@/components/Tasks/Header.vue'
import Footer from '@/components/Tasks/Footer.vue'
import Status from '@/components/Tasks/Status.vue'
import Action from '@/components/Tasks/Action.vue'

import Constant from '@/config/constant'
import Titan22 from '@/services/Titan22/index'
import Task from '@/services/task'

export default {
  components: {
    Header,
    Footer,
    Status,
    Action
  },
  data () {
    return {
      search: '',
      selected: [],
      headers: [
        {
          text: 'Account',
          value: 'account.name',
          width: '10%'
        },
        {
          text: 'Billing',
          value: 'billing.name',
          width: '10%'
        },
        {
          text: 'Proxy List',
          value: 'proxy.name',
          width: '10%'
        },
        {
          text: 'Product',
          value: 'sku',
          width: '10%'
        },
        {
          text: 'Size',
          value: 'sizes',
          width: '10%'
        },
        {
          text: 'Status',
          value: 'status',
          align: 'center'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'center',
          filterable: false,
          sortable: false,
          width: '17%'
        }
      ],
      windowSize: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
    ...mapState('cloudflare', { cloudflare: 'items' })
  },
  watch: {
    tasks () {
      if (!this.tasks.filter((el) => el.status.id === Constant.STATUS.RUNNING).length) this.initCf()
    }
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem', deleteTask: 'deleteItem' }),
    ...mapActions('cloudflare', { initCf: 'init', removeToQueue: 'removeToQueue', setDoors: 'setDoors' }),

    getSizes (item) {
      const data = { ...item }
      return data.sizes.map((el) => el.label).join(' | ')
    },
    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    async onStart (item) {
      const currentTask = this.tasks.find((el) => el.id === item.id)

      if (currentTask.status.id === Constant.STATUS.STOPPED) {
        await this.updateTask({
          ...item,
          status: {
            id: Constant.STATUS.RUNNING,
            msg: 'running',
            class: 'orange'
          },
          paid: false
        })

        await Task.updateCurrentTaskLog(item.id, 'Starting...')
        Titan22.start(item.id)
      }
    },
    async onStop (item) {
      const currentTask = this.tasks.find((el) => el.id === item.id)

      if (currentTask.status.id === Constant.STATUS.RUNNING) {
        const data = {
          ...currentTask,
          status: {
            id: Constant.STATUS.STOPPED,
            msg: 'stopped',
            class: 'grey'
          },
          transactionData: {},
          loading: true
        }

        await this.updateTask(data)

        await this.removeToQueue(this.cloudflare.queue.findIndex((el) => el.id === item.id))

        const doors = this.cloudflare.doors.slice()
        const key = doors.findIndex((el) => !el)
        doors[key] = true
        await this.setDoors(doors)

        await Task.updateCurrentTaskLog(item.id, 'Stopped!')

        data.proxy.configs = data.proxy.configs.map((el) => {
          try {
            if (el.request) {
              el.request.cancel()
              delete el.request
            }
          } catch (error) {
            console.log(error)
          }

          return el
        })

        const vm = this
        setTimeout(async () => {
          data.loading = false

          await vm.updateTask(data)

          await Task.updateCurrentTaskLog(item.id, '====================')
        }, 2000)
      }
    },
    async onDelete (item) {
      await this.onStop(item)
      this.deleteTask(item)
      const key = this.selected.findIndex((el) => el.id === item.id)
      this.selected.splice(key, 1)
    },
    async onInit (item) {
      this.removeToQueue(this.cloudflare.queue.findIndex((el) => el.id === item.id))

      const currentTask = this.tasks.find((el) => el.id === item.id)

      if (currentTask.status.id === Constant.STATUS.STOPPED) {
        await this.updateTask({
          ...item,
          status: {
            id: Constant.STATUS.RUNNING,
            msg: 'running',
            class: 'orange'
          }
        })

        await Task.updateCurrentTaskLog(item.id, 'Initializing...')
        Titan22.verify(item.id)
      }
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
