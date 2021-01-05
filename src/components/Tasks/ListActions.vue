<template>
  <div>
    <v-btn
      v-if="task.status.id === 1"
      :disabled="task.status.class === 'error'"
      icon
      color="success"
      depressed
      @click="$emit('click:startTask', task)"
    >
      <v-icon v-text="'mdi-play'" />
    </v-btn>

    <v-btn
      v-if="task.status.id === 2"
      icon
      color="warning"
      depressed
      @click="$emit('click:stopTask', task)"
    >
      <v-icon v-text="'mdi-stop'" />
    </v-btn>

    <v-btn
      icon
      color="primary"
      depressed
      @click="$emit('click:editTask', task)"
    >
      <v-icon
        small
        v-text="'mdi-pencil'"
      />
    </v-btn>

    <v-btn
      icon
      color="error"
      depressed
      @click="$emit('click:deleteTask', task)"
    >
      <v-icon
        small
        v-text="'mdi-delete'"
      />
    </v-btn>

    <v-menu offset-y>
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          color="primary"
          v-bind="attrs"
          icon
          depressed
          v-on="on"
        >
          <v-icon v-text="'mdi-dots-vertical'" />
        </v-btn>
      </template>

      <v-list
        nav
        dense
        rounded
      >
        <v-list-item
          link
          @click="$emit('click:verifyTask', task)"
        >
          <v-list-item-title v-text="'Verify'" />
        </v-list-item>

        <v-list-item
          link
          @click="$emit('click:duplicateTask', task)"
        >
          <v-list-item-title v-text="'Duplicate'" />
        </v-list-item>

        <v-list-item
          link
          @click="$emit('click:openLogs', task)"
        >
          <v-list-item-title v-text="'Logs'" />
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  }
}
</script>
