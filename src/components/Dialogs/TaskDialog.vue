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
            v-text="'New Task'"
          />
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="taskName"
                  label="Task name"
                  required
                  outlined
                  dense
                  hide-details="auto"
                  autocomplete="off"
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="email"
                  label="Email"
                  required
                  outlined
                  dense
                  :error-messages="emailErrors"
                  hide-details="auto"
                  autocomplete="off"
                  @blur="$v.email.$touch()"
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="password"
                  label="Password"
                  required
                  :type="showPassword ? 'text' : 'password'"
                  outlined
                  dense
                  :error-messages="passwordErrors"
                  hide-details="auto"
                  autocomplete="off"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @blur="$v.password.$touch()"
                  @click:append="showPassword = !showPassword"
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="sku"
                  label="SKU"
                  required
                  outlined
                  dense
                  :error-messages="skuErrors"
                  hide-details="auto"
                  autocomplete="off"
                  @blur="$v.sku.$touch()"
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
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
              </v-col>
            </v-row>

            <br>

            <v-divider />

            <br>

            <h3 v-text="'Billing details'" />

            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="bank"
                  hide-details="auto"
                  required
                  :error-messages="bankErrors"
                  clearable
                  :items="availableBanks"
                  outlined
                  dense
                  label="Bank"
                  item-text="name"
                  return-object
                  @blur="$v.bank.$touch()"
                />
              </v-col>

              <v-col
                v-if="!isGcash"
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="cardHolder"
                  label="Card holder"
                  required
                  outlined
                  dense
                  :error-messages="cardHolderErrors"
                  hide-details="auto"
                  autocomplete="off"
                  @blur="$v.cardHolder.$touch()"
                />
              </v-col>

              <v-col
                cols="12"
                :md="isGcash ? 12 : 6"
              >
                <v-text-field
                  v-model="cardNumber"
                  label="Card number"
                  required
                  outlined
                  dense
                  :error-messages="cardNumberErrors"
                  hide-details="auto"
                  type="number"
                  autocomplete="off"
                  @blur="$v.cardNumber.$touch()"
                />
              </v-col>

              <v-col
                v-if="!isGcash"
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="expiry"
                  label="Expiry date"
                  required
                  outlined
                  dense
                  :error-messages="expiryErrors"
                  hide-details="auto"
                  autocomplete="off"
                  @blur="$v.expiry.$touch()"
                />
              </v-col>

              <v-col
                v-if="!isGcash"
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="cvv"
                  label="Cvv"
                  required
                  outlined
                  dense
                  :error-messages="cvvErrors"
                  hide-details="auto"
                  type="number"
                  autocomplete="off"
                  @blur="$v.cvv.$touch()"
                />
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
import { required, email, numeric, maxLength, requiredIf } from 'vuelidate/lib/validators'

export default {
  props: {
    task: {
      type: Object,
      default: Object
    }
  },
  data () {
    return {
      dialog: false,
      taskName: '',
      email: '',
      password: '',
      sku: '',
      sizes: [],
      bank: {},
      cardHolder: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      showPassword: false
    }
  },
  computed: {
    ...mapState('task', { allTasks: 'items' }),
    ...mapState('attribute', { attributes: 'items' }),
    ...mapState('bank', { availableBanks: 'items' }),
    /**
     * Identify if the form is on edit mode.
     *
     */
    isEditMode () {
      return !!Object.keys(this.task).length
    },
    /**
     * Identify if bank is gcash.
     *
     */
    isGcash () {
      return (this.bank.id === 1)
    },
    /**
     * Error messages for email.
     *
     */
    emailErrors () {
      const errors = []

      if (!this.$v.email.$dirty) return errors

      this.$v.email.required || errors.push('Required')
      this.$v.email.email || errors.push('Invalid email')

      return errors
    },
    /**
     * Error messages for password.
     *
     */
    passwordErrors () {
      const errors = []

      if (!this.$v.password.$dirty) return errors

      this.$v.password.required || errors.push('Required')

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
     * Error messages for bank.
     *
     */
    bankErrors () {
      const errors = []

      if (!this.$v.bank.$dirty) return errors

      this.$v.bank.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for cardHolder.
     *
     */
    cardHolderErrors () {
      const errors = []

      if (!this.$v.cardHolder.$dirty) return errors

      this.$v.cardHolder.requiredIf || errors.push('Required')

      return errors
    },
    /**
     * Error messages for cardNumber.
     *
     */
    cardNumberErrors () {
      const errors = []

      if (!this.$v.cardNumber.$dirty) return errors

      this.$v.cardNumber.required || errors.push('Required')
      this.$v.cardNumber.numeric || errors.push('Accepts only numerics')

      return errors
    },
    /**
     * Error messages for expiry.
     *
     */
    expiryErrors () {
      const errors = []

      if (!this.$v.expiry.$dirty) return errors

      this.$v.expiry.requiredIf || errors.push('Required')

      return errors
    },
    /**
     * Error messages for cvv.
     *
     */
    cvvErrors () {
      const errors = []

      if (!this.$v.cvv.$dirty) return errors

      this.$v.cvv.requiredIf || errors.push('Required')
      this.$v.cvv.numeric || errors.push('Accepts only numerics')
      this.$v.cvv.maxLength || errors.push('Maximum length')

      return errors
    }
  },
  watch: {
    task () {
      if (Object.keys(this.task).length) {
        const sizes = this.task.sizes.slice().map((val) => val.label)

        this.taskName = this.task.name
        this.email = this.task.email
        this.password = this.task.password
        this.sku = this.task.sku
        this.sizes = sizes
        this.bank = {
          id: this.task.bank.id,
          name: this.task.bank.name
        }
        this.cardNumber = this.task.bank.cardNumber
        this.cardHolder = this.task.bank.cardHolder
        this.expiry = this.task.bank.expiry
        this.cvv = this.task.bank.cvv
      }
    }
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem', updateTask: 'updateItem' }),
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

      this.taskName = ''
      this.email = ''
      this.password = ''
      this.sku = ''
      this.sizes = []
      this.bank = {}
      this.cardHolder = ''
      this.cardNumber = ''
      this.expiry = ''
      this.cvv = ''
      this.showPassword = false
      this.dialog = false
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
          name: this.taskName,
          email: this.email,
          password: this.password,
          sku: this.sku,
          sizes: sizes,
          bank: {
            ...this.bank,
            cardNumber: this.cardNumber,
            cardHolder: this.cardHolder,
            expiry: this.expiry,
            cvv: this.cvv
          }
        }

        if (this.isEditMode) {
          this.updateTask({
            id: this.task.id,
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
    email: {
      required,
      email
    },
    password: { required },
    sku: { required },
    sizes: { required },
    bank: { required },
    cardHolder: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      })
    },
    cardNumber: {
      required,
      numeric
    },
    expiry: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      })
    },
    cvv: {
      numeric,
      maxLength: maxLength(3),
      requiredIf: requiredIf(function () {
        return !this.isGcash
      })
    }
  }
}
</script>
