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
              label="Task name"
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
import { required } from 'vuelidate/lib/validators'

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
      selectedTask: {}
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
      this.$v.$reset()

      this.name = ''
      this.sku = ''
      this.sizes = []

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
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label === element))

          const size = attr.sizes.find((data) => data.label === element)

          sizes.push({
            attribute_id: attr.attribute_id,
            value: size.value,
            label: size.label
          })
        })

        const params = {
          name: this.name.trim(),
          email: this.profile.email,
          password: this.profile.password,
          sku: this.sku.trim(),
          sizes: sizes,
          bank: {
            id: this.bank.bank.id,
            name: this.bank.bank.name,
            cardNumber: this.bank.number,
            cardHolder: this.bank.holder,
            expiry: this.bank.expiry,
            cvv: this.bank.cvv
          }
        }

        if (this.isEditMode) {
          this.updateTask({
            id: this.selectedTask.id,
            ...params,
            status: {
              id: 1,
              msg: 'stopped',
              class: 'grey'
            },
            transactionData: {}
          })
        } else {
          this.addTask({
            ...params
          })
        }

        this.onCancel()
      }
    }
  },
  validations: {
    profile: { required },
    sku: { required },
    sizes: { required }
  }
}
</script>
