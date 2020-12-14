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
            v-text="`${header} Task`"
          />
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-text-field
              v-model="name"
              label="Task name (optional)"
              required
              outlined
              dense
              autocomplete="off"
            />

            <v-row>
              <v-col class="pt-0 pb-0">
                <v-autocomplete
                  v-model="profile"
                  required
                  :error-messages="profileErrors"
                  clearable
                  :items="profiles"
                  outlined
                  dense
                  label="Profile"
                  item-text="name"
                  return-object
                  @blur="$v.profile.$touch()"
                />
              </v-col>

              <v-col class="pt-0 pb-0">
                <v-autocomplete
                  v-model="bank"
                  clearable
                  :items="banks"
                  outlined
                  dense
                  label="Bank"
                  item-text="nickname"
                  return-object
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col class="pt-0 pb-0">
                <v-text-field
                  v-model="sku"
                  label="SKU"
                  required
                  outlined
                  dense
                  :error-messages="skuErrors"
                  autocomplete="off"
                  @blur="$v.sku.$touch()"
                />
              </v-col>

              <v-col class="pt-0 pb-0">
                <v-text-field
                  v-model="qty"
                  dense
                  outlined
                  type="number"
                  hide-details="auto"
                  :error-messages="qtyErrors"
                  label="Quantity"
                  @blur="$v.qty.$touch()"
                />
              </v-col>
            </v-row>

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
              :error-messages="sizesErrors"
              hint="Press Enter per input to apply"
              @blur="$v.sizes.$touch()"
              @input="filterSizes"
            />

            <v-row>
              <v-col>
                <v-text-field
                  v-model="delay"
                  dense
                  outlined
                  type="number"
                  hide-details="auto"
                  :error-messages="delayErrors"
                  label="Delays"
                  hint="Input value in milliseconds"
                  @blur="$v.delay.$touch()"
                />
              </v-col>

              <v-col>
                <v-menu
                  ref="placeOrderMenu"
                  v-model="placeOrderMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="placeOrder"
                  transition="scale-transition"
                  offset-y
                  max-width="350px"
                  min-width="350px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="placeOrder"
                      dense
                      hide-details
                      outlined
                      readonly
                      v-bind="attrs"
                      clearable
                      label="Place Order At"
                      v-on="on"
                    />
                  </template>
                  <v-time-picker
                    v-if="placeOrderMenu"
                    v-model="placeOrder"
                    full-width
                    ampm-in-title
                    format="ampm"
                    use-seconds
                    color="primary"
                    @click:second="$refs.placeOrderMenu.save(placeOrder)"
                  />
                </v-menu>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            rounded
            class="primary"
            small
            @click="onCancel"
            v-text="'Cancel'"
          />
          <v-btn
            class="primary"
            rounded
            type="submit"
            small
            v-text="'Save'"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { required, minValue } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dialog: false,
      name: '',
      sku: '',
      sizes: [],
      profile: {},
      bank: {},
      isEditMode: false,
      selectedTask: {},
      delay: 1000,
      placeOrder: '',
      placeOrderMenu: false,
      qty: 1
    }
  },
  computed: {
    ...mapState('task', { allTasks: 'items' }),
    ...mapState('attribute', { attributes: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('bank', { banks: 'items' }),

    /**
     * Set modal header.
     *
     */
    header () {
      return this.isEditMode ? 'Edit' : 'New'
    },
    /**
     * Error messages for profile.
     *
     */
    profileErrors () {
      const errors = []

      if (!this.$v.profile.$dirty) return errors

      this.$v.profile.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for sku.
     *
     */
    skuErrors () {
      const errors = []

      if (!this.$v.sku.$dirty) return errors

      this.$v.sku.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for sizes.
     *
     */
    sizesErrors () {
      const errors = []

      if (!this.$v.sizes.$dirty) return errors

      this.$v.sizes.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for delay.
     *
     */
    delayErrors () {
      const errors = []

      if (!this.$v.delay.$dirty) return errors

      this.$v.delay.minValue || errors.push('Invalid input')

      return errors
    },
    /**
     * Error messages for qty.
     *
     */
    qtyErrors () {
      const errors = []

      if (!this.$v.qty.$dirty) return errors

      this.$v.qty.minValue || errors.push('Invalid input')

      return errors
    }
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem', updateTask: 'updateItem' }),

    /**
     * Map selected task.
     *
     */
    mapData (task) {
      if (Object.keys(task).length) {
        this.selectedTask = task

        const sizes = task.sizes.slice().map((val) => val.label)

        this.name = task.name
        this.sku = task.sku
        this.sizes = sizes
        this.delay = task.delay
        this.placeOrder = task.placeOrder
        this.qty = task.qty

        this.profile = task.profile
        this.bank = task.bank

        this.isEditMode = true
        this.dialog = true
      }
    },
    /**
     * Filter input sizes.
     *
     */
    filterSizes () {
      if (this.sizes.length) {
        const sizes = []

        this.sizes.forEach(element => {
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase()))

          if (attr && !sizes.find((val) => val.toLowerCase() === element.toLowerCase())) sizes.push(element)
        })

        this.sizes = sizes
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.$v.$reset()

      this.name = ''
      this.sku = ''
      this.sizes = []
      this.bank = {}
      this.profile = {}
      this.selectedTask = {}
      this.delay = 1000
      this.placeOrder = ''
      this.placeOrderMenu = false
      this.qty = 1

      this.dialog = false
      this.isEditMode = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const sizes = []

        this.sizes.forEach(element => {
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase()))

          const size = attr.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase())

          sizes.push({
            attribute_id: attr.attribute_id,
            value: size.value,
            label: size.label
          })
        })

        const params = {
          name: this.name.trim(),
          sku: this.sku.trim(),
          sizes: sizes,
          profile: this.profile,
          bank: this.bank || {},
          delay: this.delay,
          placeOrder: this.placeOrder,
          qty: this.qty
        }

        if (this.isEditMode) {
          this.updateTask({
            ...this.selectedTask,
            ...params
          })
        } else {
          this.addTask({ ...params })
        }

        this.onCancel()
      }
    }
  },
  validations: {
    profile: { required },
    sku: { required },
    sizes: { required },
    delay: { minValue: minValue(0) },
    qty: { minValue: minValue(1) }
  }
}
</script>
