<template>
  <v-layout
    v-resize="onResize"
    fluid
  >
    <v-data-table
      v-model="selected"
      :height="windowSize.y - 67 - 27 - 62 - 39"
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
        <div
          class="row cursor"
          style="width: 120px"
        >
          <div
            class="col-12 text-truncate"
            v-text="item.account.name"
          />
        </div>
      </template>

      <template v-slot:[`item.billing.name`]="{ item }">
        <div
          class="row cursor"
          style="width: 120px"
        >
          <div
            class="col-12 text-truncate"
            v-text="(item.billing) ? item.billing.name : 'none'"
          />
        </div>
      </template>

      <template v-slot:[`item.proxy.name`]="{ item }">
        <div
          class="row cursor"
          style="width: 120px"
        >
          <div
            class="col-12 text-truncate"
            v-text="(item.proxy) ? item.proxy.name : 'Localhost'"
          />
        </div>
      </template>

      <template v-slot:item.sku="{ item }">
        <div
          class="row cursor"
          style="width: 115px"
        >
          <div
            class="col-12 text-truncate"
            v-text="item.sku"
          />
        </div>
      </template>

      <template v-slot:item.sizes="{ item }">
        <div
          class="row cursor"
          style="width: 90px"
        >
          <div
            class="col-12 text-truncate"
            v-text="item.sizes.join(' | ')"
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
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Header from '@/components/Tasks/Header.vue'
import Footer from '@/components/Tasks/Footer.vue'
import Status from '@/components/Tasks/Status.vue'
import Action from '@/components/Tasks/Action.vue'

import Constant from '@/config/constant'

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
    // ...mapState('proxy', ['items'])
    ...mapState('task', { tasks: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem', deleteTask: 'deleteItem' }),

    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    onStart (item) {
      this.updateTask({
        ...item,
        status: {
          id: Constant.STATUS.RUNNING,
          msg: 'running',
          class: 'orange'
        }
      })

      // TODO: start automation
    },
    onStop (item) {
      this.updateTask({
        ...item,
        status: {
          id: Constant.STATUS.STOPPED,
          msg: 'stopped',
          class: 'grey'
        }
      })

      // TODO: cancel request
    },
    async onDelete (item) {
      const index = this.tasks.findIndex((el) => el.id === item.id)
      await this.onStop(item)
      this.deleteTask(index)
    },
    onInit (item) {
      this.updateTask({
        ...item,
        status: {
          id: Constant.STATUS.RUNNING,
          msg: 'running',
          class: 'orange'
        }
      })

      // TODO: start automation
    }
    // test () {
    //   console.log(this.items[0].configs[0])

    //   this.items[0].configs[0].rp({
    //     ...this.items[0].configs[0].options,
    //     url: 'https://cf-js-challenge.sayem.eu.org/',
    //     method: 'get',
    //     headers: {
    //       ...this.items[0].configs[0].options.headers,
    //       'Content-Type': 'application/json'
    //     },
    //     proxy: this.items[0].configs[0].options.proxy,
    //     jar: this.items[0].configs[0].options.jar
    //   })
    //     .then((res) => {
    //       console.log(res)
    //     })
    //     .catch((err) => {
    //       console.log(err)
    //     })
    // }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
