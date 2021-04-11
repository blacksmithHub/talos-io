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
          <Footer />
        </template>

        <template v-slot:[`item.profile.name`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.profile.name"
            />
          </div>
        </template>

        <template v-slot:[`item.bank.nickname`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.bank.nickname || 'N/A'"
            />
          </div>
        </template>

        <template v-slot:[`item.proxy.name`]="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.proxy.name"
            />
          </div>
        </template>

        <template v-slot:item.sku="{ item }">
          <div
            class="row cursor"
            style="width: 150px"
          >
            <div
              class="col-12 text-truncate"
              v-text="item.sku"
            />
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <div class="pa-1">
            <p
              class="mb-1"
            >
              <v-icon
                left
                x-small
                v-text="'mdi-timelapse'"
              />
              <small
                class="text-capitalize cursor"
                v-text="'1000ms'"
              />
            </p>

            <v-chip
              outlined
              small
              class="text-capitalize"
              v-text="item.status"
            />

            <p
              class="mb-0 mt-1"
            >
              <v-icon
                left
                x-small
                v-text="'mdi-alarm-check'"
              />
              <small
                class="cursor"
                v-text="'20:20 am'"
              />
            </p>
          </div>
        </template>

        <template v-slot:item.actions="{}">
          <div>
            <v-btn
              icon
              color="success"
              depressed
            >
              <v-icon
                small
                v-text="'mdi-play'"
              />
            </v-btn>

            <v-btn
              icon
              color="warning"
              depressed
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
            >
              <v-icon
                small
                v-text="'mdi-delete'"
              />
            </v-btn>

            <v-menu offset-y>
              <template v-slot:activator="{ attrs, on }">
                <v-btn
                  color="secondary"
                  v-bind="attrs"
                  icon
                  depressed
                  v-on="on"
                >
                  <v-icon
                    small
                    v-text="'mdi-dots-vertical'"
                  />
                </v-btn>
              </template>

              <v-list
                nav
                dense
                rounded
                class="text-center"
              >
                <v-list-item
                  link
                >
                  <v-list-item-title v-text="'Initialize'" />
                </v-list-item>

                <v-list-item
                  link
                >
                  <v-list-item-title v-text="'Duplicate'" />
                </v-list-item>

                <v-list-item
                  link
                >
                  <v-list-item-title v-text="'Logs'" />
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </v-layout>
  </div>
</template>

<script>
import Header from '@/components/Tasks/Header.vue'
import Footer from '@/components/Tasks/Footer.vue'

export default {
  components: {
    Header,
    Footer
  },
  data () {
    return {
      search: '',
      selected: [],
      headers: [
        {
          text: 'Profile',
          value: 'profile.name',
          width: '10%'
        },
        {
          text: 'Bank',
          value: 'bank.nickname',
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
      tasks: [
        {
          profile: {
            name: 'asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd'
          },
          bank: {
            nickname: 'asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd'
          },
          proxy: {
            name: 'asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd'
          },
          sku: 'asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd',
          status: 'asd'
        }
      ],
      windowSize: {
        x: 0,
        y: 0
      }
    }
  },
  methods: {
    onResize () {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: default
}
</style>
