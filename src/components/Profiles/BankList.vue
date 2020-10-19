<template>
  <div>
    <v-toolbar
      dense
      rounded
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
          >
            <v-icon
              :left="$vuetify.breakpoint.lgAndUp"
              v-text="'mdi-plus'"
            />
            <span
              v-if="$vuetify.breakpoint.lgAndUp"
              v-text="'add bank'"
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
          >
            <v-icon
              :left="$vuetify.breakpoint.lgAndUp"
              v-text="'mdi-playlist-plus'"
            />
            <span
              v-if="$vuetify.breakpoint.lgAndUp"
              v-text="'import banks'"
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
          >
            <v-icon
              :left="$vuetify.breakpoint.lgAndUp"
              v-text="'mdi-delete'"
            />
            <span
              v-if="$vuetify.breakpoint.lgAndUp"
              v-text="'delete all banks'"
            />
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <v-list
      v-if="banks.length"
      class="pa-0"
      three-line
    >
      <template v-for="(bank, index) in banks">
        <v-list-item
          :key="`${index}-item`"
          class="pa-0"
        >
          <v-list-item-content class="pa-2">
            <v-list-item-title v-text="bank.name" />

            <v-list-item-subtitle>
              <strong
                class="text-capitalize"
                v-text="'bank:'"
              />
              {{ bank.bank }}
            </v-list-item-subtitle>

            <v-list-item-subtitle>
              <strong
                class="text-capitalize"
                v-text="'card #:'"
              />
              <input
                :value="bank.number"
                class="ml-1 grey--text"
                readonly
                disabled
                type="password"
              >
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon
                color="primary"
                v-text="'mdi-delete'"
              />
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider
          v-if="index < banks.length - 1"
          :key="`${index}-divider`"
        />
      </template>
    </v-list>

    <v-list v-else>
      <v-list-item class="pa-0 list">
        <v-list-item-content class="pa-2 text-center">
          <small v-text="'No task found'" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('bank', { banks: 'items' })
  },
  methods: {
    ...mapActions('bank', { deletebank: 'deleteItem' })
  }
}
</script>
