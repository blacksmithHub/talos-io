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
            @click="addNewProfile"
          >
            <v-icon
              :left="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              v-text="'mdi-plus'"
            />
            <span
              v-if="$vuetify.breakpoint.lgAndUp"
              v-text="'add profile'"
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
            @click="importProfiles"
          >
            <v-icon
              :left="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              v-text="'mdi-upload'"
            />
            <span
              v-if="$vuetify.breakpoint.lgAndUp"
              v-text="'import profiles'"
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
            @click="reset"
          >
            <v-icon
              :left="$vuetify.breakpoint.lgAndUp"
              :small="$vuetify.breakpoint.lgAndUp"
              v-text="'mdi-delete'"
            />
            <span
              v-if="$vuetify.breakpoint.lgAndUp"
              v-text="'delete all profiles'"
            />
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <v-list
      v-if="profiles.length"
      class="pa-0"
      three-line
    >
      <template v-for="(profile, index) in profiles">
        <v-list-item
          :key="`${index}-item`"
          class="pa-0"
        >
          <v-list-item-content
            class="pa-2 profile"
            @click="editProfile(profile)"
          >
            <v-list-item-title v-text="profile.name" />

            <v-list-item-subtitle>
              <strong
                class="text-capitalize"
                v-text="'email:'"
              />
              {{ profile.email }}
            </v-list-item-subtitle>

            <v-list-item-subtitle>
              <strong
                class="text-capitalize"
                v-text="'password:'"
              />
              <input
                :value="profile.password"
                class="ml-1 grey--text"
                readonly
                disabled
                type="password"
              >
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn
              icon
              @click="deleteProfile(index)"
            >
              <v-icon
                color="primary"
                v-text="'mdi-delete'"
              />
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider
          v-if="index < profiles.length - 1"
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

    <ProfileDialog ref="profileDialog" />
    <ImportProfileDialog ref="importProfileDialog" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import ProfileDialog from '@/components/Profiles/ProfileDialog'
import ImportProfileDialog from '@/components/Profiles/ImportProfileDialog'

export default {
  components: {
    ProfileDialog,
    ImportProfileDialog
  },
  computed: {
    ...mapState('profile', { profiles: 'items' })
  },
  methods: {
    ...mapActions('profile', { deleteProfile: 'deleteItem', reset: 'reset' }),

    /**
     * Trigger add new profile dialog event.
     */
    addNewProfile () {
      this.$refs.profileDialog.dialog = true
    },
    /**
     * Trigger edit profile dialog event.
     */
    editProfile (profile) {
      this.$refs.profileDialog.mapData(profile)
    },
    /**
     * Trigger import profiles dialog event.
     */
    importProfiles () {
      this.$refs.importProfileDialog.dialog = true
    }
  }
}
</script>

<style scoped>
.profile:hover {
  cursor: pointer;
}
</style>
