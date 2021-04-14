<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="400px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title style="border-bottom:1px solid #d85820">
          <span
            class="headline primary--text"
            v-text="'Edit All'"
          />

          <v-spacer />

          <v-btn
            icon
            class="primary--text"
            @click="onCancel"
          >
            <v-icon v-text="'mdi-close'" />
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-container>
            <v-list>
              <v-list-item
                v-if="editAutoPay"
                class="pa-0"
              >
                <v-list-item-content class="pa-2">
                  <v-list-item-title v-text="'Auto Pay'" />
                  <v-list-item-subtitle v-text="'Submit payment automatically'" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-switch
                    v-model="autoPay"
                    inset
                  />
                </v-list-item-action>
              </v-list-item>

              <v-list-item
                v-if="editAutoFill"
                class="pa-0"
              >
                <v-list-item-content class="pa-2">
                  <v-list-item-title v-text="'Auto Fill'" />

                  <v-list-item-subtitle v-text="'Fill up billing details automatically'" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-switch
                    v-model="autoFill"
                    inset
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-container class="text-right">
            <v-btn
              rounded
              class="mr-3"
              depressed
              small
              outlined
              color="primary"
              @click="onCancel"
              v-text="'close'"
            />
            <v-btn
              color="primary"
              rounded
              type="submit"
              small
              depressed
              outlined
              v-text="'Save'"
            />
          </v-container>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    selected: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      dialog: false,
      autoPay: false,
      autoFill: false,

      editAutoPay: false,
      editAutoFill: false
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' })
  },
  watch: {
    editAutoPay () {
      if (this.editAutoPay) this.dialog = true
    },
    editAutoFill () {
      if (this.editAutoFill) this.dialog = true
    }
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * On cancel event.
     */
    onCancel () {
      this.dialog = false
      this.autoPay = false
      this.autoFill = false
      this.editAutoPay = false
      this.editAutoFill = false
    },
    /**
     * On submit event.
     */
    submit () {
      const params = {}

      if (this.editAutoPay) {
        if (this.autoPay) {
          params.autoPay = true
          params.autoFill = false
        } else {
          params.autoPay = true
          params.autoFill = false
        }
      }

      if (this.editAutoFill) {
        if (this.autoFill) {
          params.autoPay = false
          params.autoFill = true
        } else {
          params.autoPay = false
          params.autoFill = true
        }
      }

      const data = (this.selected.length) ? this.selected : this.tasks
      data.forEach(el => {
        this.updateTask({
          id: el.id,
          ...el,
          ...params
        })
      })

      this.showSnackbar({ message: 'Updated successfully' })
      this.onCancel()
    }
  }
}
</script>
