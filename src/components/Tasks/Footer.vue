<template>
  <div>
    <v-row
      align="center"
      justify="center"
      class="text-center pa-3"
    >
      <v-col
        cols="2"
        align-self="center"
      >
        <v-btn
          rounded
          small
          color="success"
          depressed
          outlined
          @click="startAll"
        >
          <v-icon
            left
            v-text="'mdi-play'"
          />
          <span v-text="'start all'" />
        </v-btn>
      </v-col>

      <v-divider
        class="mt-4 mb-4"
        vertical
      />

      <v-col
        cols="2"
        align-self="center"
      >
        <v-btn
          rounded
          small
          color="error"
          depressed
          outlined
          @click="stopAll"
        >
          <v-icon
            left
            v-text="'mdi-stop'"
          />
          <span v-text="'stop all'" />
        </v-btn>
      </v-col>

      <v-divider
        class="mt-4 mb-4"
        vertical
      />

      <v-col
        cols="4"
        align-self="center"
      >
        <v-btn
          rounded
          small
          color="cyan"
          depressed
          outlined
          @click="initAll"
        >
          <v-icon
            left
            v-text="'mdi-fast-forward'"
          />
          <span v-text="'initialize all'" />
        </v-btn>
      </v-col>

      <v-divider
        class="mt-4 mb-4"
        vertical
      />

      <v-col
        cols="2"
        align-self="center"
      >
        <v-menu
          top
          close-on-content-click
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              rounded
              small
              color="warning"
              depressed
              outlined
              v-on="on"
            >
              <v-icon
                left
                v-text="'mdi-pencil'"
              />
              <span v-text="'edit all'" />
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
              @click="$refs.selectDialog.editAutoPay = true"
            >
              <v-list-item-title v-text="'Auto Pay'" />
            </v-list-item>

            <v-list-item
              link
              @click="$refs.selectDialog.editAutoFill = true"
            >
              <v-list-item-title v-text="'Auto Fill'" />
            </v-list-item>

            <v-list-item
              link
              @click="$refs.massEditDialog.dialog = true"
            >
              <v-list-item-title v-text="'See all'" />
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>

      <v-divider
        class="mt-4 mb-4"
        vertical
      />

      <v-col
        cols="2"
        align-self="center"
      >
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

    <MassEditDialog
      ref="massEditDialog"
      :selected="selected"
    />
    <SelectDialog
      ref="selectDialog"
      :selected="selected"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import MassEditDialog from '@/components/Tasks/MassEditDialog.vue'
import SelectDialog from '@/components/Tasks/SelectDialog.vue'

export default {
  components: {
    MassEditDialog,
    SelectDialog
  },
  props: {
    selected: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' })
  },
  methods: {
    startAll () {
      const data = (this.selected.length) ? this.selected : this.tasks
      data.forEach(el => {
        this.$emit('click:start', el)
      })
    },
    stopAll () {
      const data = (this.selected.length) ? this.selected : this.tasks
      data.forEach(el => {
        this.$emit('click:stop', el)
      })
    },
    deleteAll () {
      const data = (this.selected.length) ? this.selected : this.tasks
      data.forEach(el => {
        this.$emit('click:delete', el)
      })
    },
    initAll () {
      const data = (this.selected.length) ? this.selected : this.tasks
      data.forEach(el => {
        this.$emit('click:init', el)
      })
    }
  }
}
</script>
