<template>
  <v-card-title>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="primary mr-3"
          v-on="on"
          @click="$emit('click:verifyAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-shield-search'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'verify all tasks'"
          />
        </v-btn>
      </template>
      <span v-text="'Verify all tasks'" />
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="primary"
          v-on="on"
          @click="openLogs"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-information-outline'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'see all logs'"
          />
        </v-btn>
      </template>
      <span v-text="'See all logs'" />
    </v-tooltip>

    <v-spacer />

    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="primary mr-3"
          v-on="on"
          @click="$emit('click:startAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-play'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'start all'"
          />
        </v-btn>
      </template>
      <span v-text="'Start all task'" />
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="primary mr-3"
          v-on="on"
          @click="$emit('click:stopAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-stop'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'stop all'"
          />
        </v-btn>
      </template>
      <span v-text="'Stop all tasks'" />
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="primary"
          v-on="on"
          @click="$emit('click:deleteAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-delete'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'delete all'"
          />
        </v-btn>
      </template>
      <span v-text="'Delete all tasks'" />
    </v-tooltip>
  </v-card-title>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  methods: {
    /**
     * Open logs
     */
    openLogs () {
      ipcRenderer.send('toggle-logs')
    }
  }
}
</script>
