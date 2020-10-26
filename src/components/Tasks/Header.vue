<template>
  <v-toolbar
    rounded
    dense
  >
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
          @click="$emit('click:AddTask')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-plus'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'add task'"
          />
        </v-btn>
      </template>
      <span v-text="'Add new task'" />
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
          @click="$emit('click:ImportTasks')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-upload'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'import tasks'"
          />
        </v-btn>
      </template>
      <span v-text="'Import multiple tasks'" />
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
          @click="$emit('click:editAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-content-duplicate'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'edit all'"
          />
        </v-btn>
      </template>
      <span v-text="'Edit all tasks'" />
    </v-tooltip>
  </v-toolbar>
</template>

<script>
export default {
  data () {
    return {
      //
    }
  }
}
</script>
