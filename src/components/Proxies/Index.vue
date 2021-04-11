<template>
  <div>
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
        :items="proxies"
        item-key="id"
        show-select
        hide-default-footer
        :items-per-page="proxies.length"
        fixed-header
        disable-pagination
      >
        <template v-slot:top>
          <Header :selected="(selected.length) ? selected : proxies" />
          <v-divider style="border:1px solid #d85820" />
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.name"
            />
          </div>
        </template>

        <template v-slot:[`item.proxies`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.proxies.length"
            />
          </div>
        </template>

        <template v-slot:[`item.configs`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.configs.filter((el) => el.options).length"
            />
          </div>
        </template>

        <template v-slot:item.actions="{item}">
          <div>
            <v-btn
              v-if="item.status === status.STOPPED"
              icon
              color="brown"
              depressed
              @click="onStart(item)"
            >
              <v-icon
                small
                v-text="'mdi-cookie'"
              />
            </v-btn>

            <v-btn
              v-else
              icon
              color="error"
              depressed
              :loading="item.loading"
              @click="onStop(item)"
            >
              <v-icon
                small
                v-text="'mdi-stop'"
              />
            </v-btn>

            <v-btn
              icon
              color="warning"
              depressed
              :disabled="item.status === status.RUNNING || item.loading"
              @click="onEdit(item)"
            >
              <v-icon
                small
                v-text="'mdi-pencil'"
              />
            </v-btn>

            <v-btn
              icon
              color="red"
              depressed
              :disabled="item.loading"
              @click="onDelete(item)"
            >
              <v-icon
                small
                v-text="'mdi-delete'"
              />
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-layout>

    <ProxyDialog ref="proxyDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Header from '@/components/Proxies/Header.vue'
import ProxyDialog from '@/components/Proxies/ProxyDialog.vue'

import Constant from '@/config/constant'

export default {
  components: {
    Header,
    ProxyDialog
  },
  data () {
    return {
      selected: [],
      headers: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'No. of Proxies',
          value: 'proxies'
        },
        {
          text: 'No. of Cookies',
          value: 'configs'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'center',
          filterable: false,
          sortable: false
        }
      ],
      windowSize: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapState('proxy', { proxies: 'items' }),
    status () {
      return Constant.STATUS
    }
  },
  methods: {
    ...mapActions('proxy', { updateProxy: 'updateItem', deleteProxy: 'deleteItem' }),
    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    onStart (item) {
      this.updateProxy({
        ...item,
        status: this.status.RUNNING,
        configs: []
      })
    },
    onStop (item) {
      this.updateProxy({
        ...item,
        status: this.status.STOPPED
      })
    },
    onDelete (item) {
      const index = this.proxies.findIndex((el) => el.id === item.id)
      this.deleteProxy(index)
    },
    onEdit (item) {
      this.$refs.proxyDialog.onEdit(item.id)
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
