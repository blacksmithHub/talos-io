<template>
  <div>
    <v-row
      align="center"
      class="pa-3"
    >
      <v-col
        cols="6"
        align-self="center"
      >
        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="$refs.proxyDialog.dialog = true"
        >
          <v-icon
            left
            v-text="'mdi-plus'"
          />
          <span v-text="'create proxy list'" />
        </v-btn>

        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="importData"
        >
          <v-icon
            left
            v-text="'mdi-upload'"
          />
          <span v-text="'import'" />
        </v-btn>

        <v-btn
          rounded
          small
          color="primary"
          depressed
          outlined
          @click="exportJson(proxies, 'Export Proxies To JSON')"
        >
          <v-icon
            left
            v-text="'mdi-download'"
          />
          <span v-text="'export'" />
        </v-btn>
      </v-col>

      <v-col
        cols="6"
        align-self="center"
        class="text-right"
      >
        <v-btn
          rounded
          small
          color="brown"
          depressed
          outlined
          class="mr-3"
          @click="generateAll"
        >
          <v-icon
            left
            v-text="'mdi-cookie'"
          />
          <span v-text="'generate cookies'" />
        </v-btn>

        <v-btn
          rounded
          small
          color="error"
          depressed
          outlined
          class="mr-3"
          @click="stopAll"
        >
          <v-icon
            left
            v-text="'mdi-stop'"
          />
          <span v-text="'stop all'" />
        </v-btn>

        <v-btn
          rounded
          small
          color="red"
          depressed
          outlined
          @click="deleteAll"
        >
          <v-icon
            left
            v-text="'mdi-delete'"
          />
          <span v-text="'delete all'" />
        </v-btn>
      </v-col>
    </v-row>

    <ProxyDialog ref="proxyDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import ProxyDialog from '@/components/Proxies/ProxyDialog.vue'
import Constant from '@/config/constant'
import File from '@/mixins/file'

export default {
  components: {
    ProxyDialog
  },
  mixins: [File],
  props: {
    selected: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapState('proxy', { proxies: 'items' }),
    status () {
      return Constant.STATUS
    }
  },
  methods: {
    ...mapActions('proxy', ['addItem']),
    ...mapActions('dialog', ['openDialog']),

    generateAll () {
      const items = (this.selected.length) ? this.selected : this.proxies

      items.forEach(element => {
        this.$emit('start', element)
      })
    },
    stopAll () {
      const items = (this.selected.length) ? this.selected : this.proxies

      items.forEach(element => {
        this.$emit('stop', element)
      })
    },
    deleteAll () {
      this.openDialog({
        title: 'Confirmation',
        body: 'Are you sure you want to delete this bank?',
        action: async () => {
          const items = (this.selected.length) ? this.selected : this.proxies

          items.forEach(element => {
            this.$emit('delete', element)
          })
        }
      })
    },
    async importData () {
      const data = await this.importJson('Import Proxies')

      if (data && data.length) {
        data.forEach((el) => {
          delete el.id
          this.addItem(el)
        })
      }
    }
  }
}
</script>
