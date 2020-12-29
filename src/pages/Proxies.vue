<template>
  <v-container>
    <v-card
      flat
      class="transparent"
    >
      <v-card-title>
        <v-toolbar
          dense
          rounded
          flat
        >
          <v-row
            no-gutters
            justify="center"
          >
            <v-col
              cols="3"
              class="text-center"
            >
              <v-btn
                :fab="!$vuetify.breakpoint.lgAndUp"
                :rounded="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                class="primary"
                depressed
                @click="addNewProxy"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-plus'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'add proxy pool'"
                />
              </v-btn>
            </v-col>

            <v-col
              cols="3"
              class="text-center"
            >
              <v-btn
                :fab="!$vuetify.breakpoint.lgAndUp"
                :rounded="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                class="primary"
                depressed
                @click="importProxies"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-upload'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'import proxies'"
                />
              </v-btn>
            </v-col>

            <v-col
              cols="3"
              class="text-center"
            >
              <v-btn
                :fab="!$vuetify.breakpoint.lgAndUp"
                :rounded="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                :x-small="!$vuetify.breakpoint.lgAndUp"
                class="error"
                depressed
                @click="reset"
              >
                <v-icon
                  :left="$vuetify.breakpoint.lgAndUp"
                  :small="$vuetify.breakpoint.lgAndUp"
                  v-text="'mdi-delete'"
                />
                <span
                  v-if="$vuetify.breakpoint.lgAndUp"
                  v-text="'delete all proxies'"
                />
              </v-btn>
            </v-col>
          </v-row>
        </v-toolbar>
      </v-card-title>

      <v-card-text style="max-height: 70vh; overflow: auto">
        <v-list
          v-if="proxies.length"
          class="pa-0"
          three-line
          dense
        >
          <template v-for="(proxy, index) in proxies">
            <v-list-item :key="`${index}-item`">
              <v-list-item-content>
                <v-row no-gutters>
                  <v-col
                    cols="6"
                    align-self="center"
                  >
                    <v-row
                      align="center"
                      no-gutters
                    >
                      <v-col
                        cols="12"
                        align-self="center"
                        class="mb-2"
                      >
                        <h3
                          class="d-inline-block text-truncate"
                          style="max-width: 40vh"
                          v-text="proxy.name"
                        />
                      </v-col>

                      <v-col
                        cols="12"
                        align-self="center"
                      >
                        <span
                          class="d-inline-block text-truncate"
                          style="max-width: 40vh"
                        >
                          <span
                            class="text-capitalize font-weight-bold"
                            v-text="'Total:'"
                          />
                          {{ proxy.proxies.length }}
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col
                    align-self="center"
                    class="text-right"
                    cols="6"
                  >
                    <v-btn
                      icon
                      color="primary"
                      class="mr-2"
                      @click="editProxy(proxy)"
                    >
                      <v-icon
                        small
                        v-text="'mdi-pencil'"
                      />
                    </v-btn>

                    <v-btn
                      icon
                      color="error"
                      @click="deleteProxy(index)"
                    >
                      <v-icon
                        small
                        v-text="'mdi-delete'"
                      />
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>

            <v-divider
              v-if="index < proxies.length - 1"
              :key="`${index}-divider`"
            />
          </template>
        </v-list>

        <v-list v-else>
          <v-list-item class="pa-0 list">
            <v-list-item-content class="pa-2 text-center">
              <small v-text="'Nothing to display'" />
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <ProxyDialog ref="proxyDialog" />
        <ImportProxyDialog ref="importProxyDialog" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import ProxyDialog from '@/components/Proxies/ProxyDialog'
import ImportProxyDialog from '@/components/Proxies/ImportProxyDialog'

export default {
  components: { ProxyDialog, ImportProxyDialog },
  computed: {
    ...mapState('proxy', { proxies: 'items' })
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    proxies () {
      try {
        ipcRenderer.send('update-proxies', this.proxies)
      } catch (error) {
        //
      }
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('proxy', { deleteProxy: 'deleteItem', reset: 'reset' }),
    /**
     * Trigger add new proxies dialog event.
     */
    addNewProxy () {
      this.$refs.proxyDialog.dialog = true
    },
    /**
     * Trigger edit proxies dialog event.
     */
    editProxy (proxy) {
      this.$refs.proxyDialog.mapData(proxy)
    },
    /**
     * Trigger import proxies dialog event.
     */
    importProxies () {
      this.$refs.importProxyDialog.dialog = true
    }
  }
}
</script>
