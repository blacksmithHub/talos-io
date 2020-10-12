<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title>
          <span
            class="headline"
            v-text="'Mass Edit'"
          />
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="sku"
                  label="SKU"
                  outlined
                  dense
                  hide-details
                  autocomplete="off"
                />
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="sizes"
                  chips
                  small-chips
                  deletable-chips
                  clearable
                  label="Sizes"
                  multiple
                  outlined
                  dense
                  append-icon=""
                  hint="Press Enter per input to apply"
                  @input="filterSizes"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            class="primary"
            rounded
            @click="onCancel"
            v-text="'cancel'"
          />
          <v-btn
            class="primary"
            rounded
            type="submit"
            v-text="'save'"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Constant from '@/config/constant'

export default {
  data () {
    return {
      dialog: false,
      sizes: [],
      sku: ''
    }
  },
  computed: {
    ...mapState('attribute', { attributes: 'items' }),
    ...mapState('task', { tasks: 'items' })
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),

    /**
     * Filter input sizes.
     *
     */
    filterSizes () {
      if (this.sizes.length) {
        const sizes = []

        this.sizes.forEach(element => {
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label === element))

          if (attr) sizes.push(element)
        })

        this.sizes = sizes
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.sizes = []
      this.sku = ''
      this.dialog = false
    },

    /**
     * On submit event.
     *
     */
    submit () {
      this.tasks.forEach(element => {
        if (this.sku) {
          this.updateTask({
            ...element,
            sku: this.sku,
            status: {
              id: Constant.TASK.STATUS.STOPPED,
              msg: 'stopped',
              class: 'grey'
            }
          })
        }

        if (this.sizes.length) {
          const sizes = []

          this.sizes.forEach(element => {
            const attr = this.attributes.find((val) => val.sizes.find((data) => data.label === element))

            const size = attr.sizes.find((data) => data.label === element)

            sizes.push({
              attribute_id: attr.attribute_id,
              value: size.value,
              label: size.label
            })
          })

          this.updateTask({
            ...element,
            sizes: sizes,
            status: {
              id: Constant.TASK.STATUS.STOPPED,
              msg: 'stopped',
              class: 'grey'
            }
          })
        }
      })

      this.onCancel()
    }
  }
}
</script>
