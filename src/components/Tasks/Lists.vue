<template>
  <v-data-table
    v-model="selected"
    no-data-text="Nothing to display"
    no-results-text="Nothing to display"
    :headers="headers"
    :items="tasks"
    item-key="id"
    show-select
    hide-default-footer
    :items-per-page="tasks.length"
    fixed-header
    height="65vh"
    disable-pagination
    :search="search"
  >
    <template v-slot:[`item.profile.name`]="{ item }">
      <span
        class="d-inline-block text-truncate"
        style="max-width: 15vh"
        :class="{'success--text': item.paid, 'teal--text': item.aco}"
        v-text="item.profile.name"
      />
    </template>

    <template v-slot:[`item.bank.nickname`]="{ item }">
      <span
        class="d-inline-block text-truncate"
        style="max-width: 15vh"
        :class="{'success--text': item.paid, 'teal--text': item.aco}"
        v-text="item.bank.nickname"
      />
    </template>

    <template v-slot:[`item.proxy.name`]="{ item }">
      <span
        class="d-inline-block text-truncate"
        style="max-width: 15vh"
        :class="{'success--text': item.paid, 'teal--text': item.aco}"
        v-text="item.proxy.name"
      />
    </template>

    <template v-slot:item.sku="{ item }">
      <v-tooltip
        bottom
        content-class="primary text-center"
        open-delay="500"
      >
        <template v-slot:activator="{ on, attrs }">
          <span
            v-bind="attrs"
            class="d-inline-block text-truncate cursor"
            :class="{'success--text': item.paid, 'teal--text': item.aco}"
            style="max-width: 15vh"
            v-on="on"
            v-text="`${item.sku}`"
          />
        </template>
        <span
          class="d-inline-block text-truncate"
          style="max-width: 50vh"
        >
          <span
            class="font-weight-bold mr-2"
            v-text="'Size(s):'"
          />
          <span v-text="getSizes(item.sizes)" />
        </span>
        <br>
        <span
          class="d-inline-block text-truncate"
          style="max-width: 50vh"
        >
          <span
            class="font-weight-bold mr-2"
            v-text="'Qty:'"
          />
          <span v-text="item.qty || 1" />
        </span>
      </v-tooltip>
    </template>

    <template v-slot:item.status="{ item }">
      <ListChipStatus
        :task="item"
        @click:checkout="$emit('click:checkout', item)"
      />
    </template>

    <template v-slot:item.actions="{ item }">
      <ListActions
        :task="item"
        @click:startTask="$emit('click:startTask', item)"
        @click:stopTask="$emit('click:stopTask', item)"
        @click:editTask="$emit('click:editTask', item)"
        @click:deleteTask="$emit('click:deleteTask', item)"
        @click:verifyTask="$emit('click:verifyTask', item)"
        @click:openLogs="$emit('click:openLogs', item)"
      />
    </template>
  </v-data-table>
</template>

<script>
import { mapState } from 'vuex'

import ListActions from '@/components/Tasks/ListActions'
import ListChipStatus from '@/components/Tasks/ListChipStatus'

export default {
  components: {
    ListActions,
    ListChipStatus
  },
  data () {
    return {
      search: '',
      selected: [],
      headers: [
        { text: 'Profile', value: 'profile.name', width: '10%' },
        { text: 'Bank', value: 'bank.nickname', width: '12%' },
        { text: 'Proxy List', value: 'proxy.name', width: '12%' },
        { text: 'Product', value: 'sku', width: '12%' },
        { text: 'Status', value: 'status', align: 'center' },
        { text: 'Actions', value: 'actions', align: 'center', filterable: false, sortable: false, width: '20%' }
      ]
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' })
  },
  methods: {
    /**
     * Return sizes.
     *
     */
    getSizes (sizes) {
      const list = []

      sizes.forEach(element => {
        list.push(element.label.toUpperCase())
      })

      return list.join(' | ')
    }
  }
}
</script>

<style scoped>
.orange-left-border {
  border-left: 3px solid orange
}
.grey-left-border {
  border-left: 3px solid grey
}
.error-left-border {
  border-left: 3px solid red
}
.success-left-border {
  border-left: 3px solid green
}
.cyan-left-border {
  border-left: 3px solid cyan
}
.light-blue-left-border {
  border-left: 3px solid lightblue
}

.cursor {
  cursor: default
}
</style>
