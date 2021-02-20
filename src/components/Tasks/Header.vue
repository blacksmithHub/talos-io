<template>
  <v-toolbar
    rounded
    dense
  >
    <v-btn
      :fab="!$vuetify.breakpoint.lgAndUp"
      :rounded="$vuetify.breakpoint.lgAndUp"
      :small="$vuetify.breakpoint.lgAndUp"
      :x-small="!$vuetify.breakpoint.lgAndUp"
      class="primary mr-3"
      depressed
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

    <v-btn
      :fab="!$vuetify.breakpoint.lgAndUp"
      :rounded="$vuetify.breakpoint.lgAndUp"
      :small="$vuetify.breakpoint.lgAndUp"
      :x-small="!$vuetify.breakpoint.lgAndUp"
      class="primary mr-3"
      depressed
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

    <v-btn
      :fab="!$vuetify.breakpoint.lgAndUp"
      :rounded="$vuetify.breakpoint.lgAndUp"
      :small="$vuetify.breakpoint.lgAndUp"
      :x-small="!$vuetify.breakpoint.lgAndUp"
      class="primary"
      depressed
      @click="$emit('click:editAll')"
    >
      <v-icon
        :left="$vuetify.breakpoint.lgAndUp"
        :small="$vuetify.breakpoint.lgAndUp"
        v-text="'mdi-content-duplicate'"
      />
      <span
        v-if="$vuetify.breakpoint.lgAndUp"
        v-text="'mass edit'"
      />
    </v-btn>
  </v-toolbar>
</template>

<style scoped>
.pointer{
  cursor: pointer;
}
</style>
