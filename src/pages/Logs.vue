<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card
          flat
          class="transparent"
        >
          <v-card-title>
            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary mr-3"
              @click="openAll"
            >
              <v-icon
                :left="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                v-text="'mdi-magnify-plus-outline'"
              />
              <span
                v-if="$vuetify.breakpoint.lgAndUp"
                v-text="'maximize all'"
              />
            </v-btn>

            <v-btn
              :fab="!$vuetify.breakpoint.lgAndUp"
              :rounded="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              :x-small="!$vuetify.breakpoint.lgAndUp"
              class="primary"
              @click="closeAll"
            >
              <v-icon
                :left="$vuetify.breakpoint.lgAndUp"
                :small="$vuetify.breakpoint.lgAndUp"
                v-text="'mdi-magnify-minus-outline'"
              />
              <span
                v-if="$vuetify.breakpoint.lgAndUp"
                v-text="'minimize all'"
              />
            </v-btn>
          </v-card-title>

          <v-card-text style="max-height: 80vh; overflow: auto">
            <v-expansion-panels
              v-if="tasks.length"
              v-model="panel"
              multiple
            >
              <v-expansion-panel
                v-for="(task, index) in tasks"
                :key="index"
              >
                <v-expansion-panel-header>
                  {{ task.name }}
                </v-expansion-panel-header>

                <v-expansion-panel-content
                  v-if="task.logs.length"
                  id="container"
                  style="max-height: 30vh; overflow: auto"
                >
                  <template
                    v-for="(log, i) in task.logs"
                  >
                    <p
                      :key="i"
                      :class="`${(i === task.logs.length - 1 && log.msg !== 'stopped') ? 'mb-8' : 'mb-1'} ${log.color}--text caption text-capitalize`"
                      v-text="log.msg"
                    />

                    <p
                      v-if="log.msg === 'stopped'"
                      :key="i+'d'"
                      class="ma-0"
                      v-text="'===================='"
                    />
                  </template>
                </v-expansion-panel-content>

                <v-expansion-panel-content
                  v-else
                  class="text-center"
                >
                  <span
                    class="caption"
                    v-text="'Nothing to display'"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <p
              class="text-center"
              v-text="'Nothing to display'"
            />
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'
import Footer from '@/components/App/Footer'

export default {
  components: { Footer },
  data () {
    return {
      panel: []
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('setting', { settings: 'items' })
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    tasks () {
      var container = this.$el.querySelector('#container')
      if (container) container.scrollTop = container.scrollHeight
    },
    panel () {
      setTimeout(() => {
        var container = this.$el.querySelector('#container')
        if (container) container.scrollTop = container.scrollHeight
      }, 100)
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })

    ipcRenderer.on('updateTasks', (event, arg) => {
      this.setTasks(arg)
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('task', { setTasks: 'setItems' }),

    openAll () {
      this.panel = this.tasks.slice().map((val, key) => key)
    },
    closeAll () {
      this.panel = []
    }
  }
}
</script>
