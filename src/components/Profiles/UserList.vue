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
              v-text="'add user'"
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
              v-text="'import users'"
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
              v-text="'delete all users'"
            />
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <v-list
      v-if="users.length"
      class="pa-0"
      three-line
    >
      <template v-for="(user, index) in users">
        <v-list-item
          :key="`${index}-item`"
          class="pa-0"
        >
          <v-list-item-content class="pa-2">
            <v-list-item-title v-text="user.name" />

            <v-list-item-subtitle>
              <strong
                class="text-capitalize"
                v-text="'email:'"
              />
              {{ user.email }}
            </v-list-item-subtitle>

            <v-list-item-subtitle>
              <strong
                class="text-capitalize"
                v-text="'password:'"
              />
              <input
                :value="user.password"
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
          v-if="index < users.length - 1"
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
    ...mapState('user', { users: 'items' })
  },
  methods: {
    ...mapActions('user', { deleteUser: 'deleteItem' })
  }
}
</script>
