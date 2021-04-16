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
          @click="$refs.proxyDialog.dialog = true"
        >
          <v-icon
            left
            v-text="'mdi-plus'"
          />
          <span v-text="'create proxy list'" />
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
          color="primary"
          depressed
          outlined
          class="mr-3"
          @click="importData"
        >
          <v-icon
            left
            v-text="'mdi-download'"
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
            v-text="'mdi-upload'"
          />
          <span v-text="'export'" />
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
  computed: {
    ...mapState('proxy', { proxies: 'items' }),
    status () {
      return Constant.STATUS
    }
  },
  methods: {
    ...mapActions('proxy', ['addItem']),

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
