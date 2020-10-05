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
                  type="password"
                  outlined
                  dense
                  :error-messages="passwordErrors"
                  hide-details="auto"
                  autocomplete="off"
                  @blur="$v.password.$touch()"
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
                <v-select
                  v-model="sizes"
                  :items="availableSizes"
                  label="Sizes"
                  multiple
                  chips
                  small-chips
                  dense
                  outlined
                  required
                  clearable
                  :error-messages="sizesErrors"
                  hide-details="auto"
                  @blur="$v.sizes.$touch()"
                />
              </v-col>
            </v-row>

            <br>

            <v-divider />

            <br>

            <h3 v-text="'Billing details'" />

            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="bank"
                  :items="availableBanks"
                  label="Bank"
                  dense
                  outlined
                  required
                  clearable
                  :error-messages="bankErrors"
                  hide-details="auto"
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
            @click="onCancel"
            v-text="'Cancel'"
          />
          <v-btn
            class="primary"
            rounded
            type="submit"
            v-text="'Add'"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { required, email, numeric, maxLength } from 'vuelidate/lib/validators'

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
      bank: '',
      cardHolder: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      isGcash: false,

      /**
       * Todo: get these from vuex
       */
      availableSizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
      availableBanks: ['GCash', 'BPI', 'PNB', 'BDO']
    }
  },
  computed: {
    ...mapState('task', { allTasks: 'items' }),
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

      this.$v.cardHolder.required || errors.push('Required')

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

      this.$v.expiry.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for cvv.
     *
     */
    cvvErrors () {
      const errors = []

      if (!this.$v.cvv.$dirty) return errors

      this.$v.cvv.required || errors.push('Required')
      this.$v.cvv.numeric || errors.push('Accepts only numerics')
      this.$v.cvv.maxLength || errors.push('Maximum length')

      return errors
    }
  },
  watch: {
    bank () {
      if (this.bank === 'GCash') {
        this.isGcash = true
      } else {
        this.isGcash = false
      }
    },
    task () {
      if (Object.keys(this.task).length) {
        this.taskName = this.task.name
        this.email = this.task.email
        this.password = this.task.password
        this.sku = this.task.sku
        this.sizes = this.task.sizes
        this.bank = (this.task.gcashNumber) ? 'GCash' : this.task.bank
        this.cardNumber = this.task.gcashNumber || this.task.cardNumber
        this.cardHolder = this.task.cardHolder
        this.expiry = this.task.expiry
        this.cvv = this.task.cvv
      }
    }
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem' }),
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.reset()
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.addTask({
          name: this.taskName,
          email: this.email,
          password: this.password,
          sku: this.sku,
          sizes: this.sizes,
          gcashNumber: 0,
          cardNumber: this.cardNumber,
          cardHolder: this.cardHolder,
          expiry: this.expiry,
          cvv: this.cvv,
          bank: this.bank
        })

        this.onCancel()
      }
    },
    /**
     * Reset fields.
     */
    reset () {
      this.$v.$reset()

      this.taskName = ''
      this.email = ''
      this.password = ''
      this.sku = ''
      this.sizes = []
      this.bank = ''
      this.cardHolder = ''
      this.cardNumber = ''
      this.expiry = ''
      this.cvv = ''
      this.isGcash = false
    }
  },
  validations: {
    email: { required, email },
    password: { required },
    sku: { required },
    sizes: { required },
    bank: { required },
    cardHolder: { required },
    cardNumber: { required, numeric },
    expiry: { required },
    cvv: { required, numeric, maxLength: maxLength(3) }
  }
}
</script>
