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
      @click="dialog=true"
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
        class="text-center"
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

    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title
          class="headline primary--text"
          style="border-bottom:1px solid #d85820"
        >
          Confirmation

          <v-spacer />

          <v-btn
            icon
            class="primary--text"
            @click="dialog=false"
          >
            <v-icon v-text="'mdi-close'" />
          </v-btn>
        </v-card-title>

        <v-card-text class="text-center pa-5">
          <v-row
            justify="center"
            align="center"
            no-gutters
            class="fill-height"
          >
            <v-col
              align-self="center"
              cols="9"
            >
              Are you sure you want to delete this task?
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-container class="text-right">
            <v-btn
              class="primary mr-2"
              rounded
              depressed
              small
              @click="dialog=false"
            >
              Disagree
            </v-btn>

            <v-btn
              depressed
              small
              class="primary"
              rounded
              @click="deleteTask"
            >
              Agree
            </v-btn>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      dialog: false
    }
  },
  methods: {
    deleteTask () {
      this.$emit('click:deleteTask', this.task)
    }
  }
}
</script>
