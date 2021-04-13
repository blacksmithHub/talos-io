<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title style="border-bottom:1px solid #d85820">
          <span
            class="headline primary--text"
            v-text="`${header} Billing`"
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
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="name"
                  label="Name (optional)"
                  outlined
                  dense
                  hide-details
                  autocomplete="off"
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="bank"
                  label="Bank"
                  outlined
                  dense
                  hide-details="auto"
                  autocomplete="off"
                  :error-messages="bankErrors"
                  @blur="$v.bank.$touch()"
                />
              </v-col>

              <v-col
                v-if="!isGcash"
                cols="6"
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

              <v-col :cols="(isGcash) ? 12 : 6">
                <v-text-field
                  v-model="cardNumber"
                  :label="(isGcash) ? 'Phone number' : 'Card number'"
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
              >
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="expiryMonth"
                      label="Expiry month"
                      required
                      outlined
                      dense
                      :error-messages="expiryMonthErrors"
                      hide-details="auto"
                      type="number"
                      autocomplete="off"
                      @blur="$v.expiryMonth.$touch()"
                    />
                  </v-col>

                  <v-col>
                    <v-text-field
                      v-model="expiryYear"
                      label="Expiry year"
                      required
                      outlined
                      dense
                      :error-messages="expiryYearErrors"
                      hide-details="auto"
                      type="number"
                      autocomplete="off"
                      @blur="$v.expiryYear.$touch()"
                    />
                  </v-col>

                  <v-col>
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
              </v-col>
            </v-row>
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
import { required, maxLength, requiredIf, maxValue, minValue } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dialog: false,
      id: null,
      name: null,
      bank: null,
      cardHolder: null,
      cardNumber: null,
      expiryMonth: null,
      expiryYear: null,
      cvv: null
    }
  },
  computed: {
    ...mapState('billing', ['items']),

    /**
     * Set modal header.
     */
    header () {
      return this.id ? 'Edit' : 'New'
    },
    /**
     * Identify if bank is gcash.
     */
    isGcash () {
      return (this.bank && this.bank.toLowerCase() === 'gcash')
    },
    /**
     * Error messages for bank.
     */
    bankErrors () {
      const errors = []

      if (!this.$v.bank.$dirty) return errors

      this.$v.bank.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for cardHolder.
     */
    cardHolderErrors () {
      const errors = []

      if (!this.$v.cardHolder.$dirty) return errors

      this.$v.cardHolder.requiredIf || errors.push('Required')

      return errors
    },
    /**
     * Error messages for cardNumber.
     */
    cardNumberErrors () {
      const errors = []

      if (!this.$v.cardNumber.$dirty) return errors

      this.$v.cardNumber.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for expiryMonth.
     */
    expiryMonthErrors () {
      const errors = []

      if (!this.$v.expiryMonth.$dirty) return errors

      this.$v.expiryMonth.requiredIf || errors.push('Required')
      this.$v.expiryMonth.maxLength || errors.push('Maximum length')
      this.$v.expiryMonth.minValue || errors.push('Invalid input')
      this.$v.expiryMonth.maxValue || errors.push('Invalid input')

      return errors
    },
    /**
     * Error messages for expiryYear.
     */
    expiryYearErrors () {
      const errors = []

      if (!this.$v.expiryYear.$dirty) return errors

      this.$v.expiryYear.requiredIf || errors.push('Required')
      this.$v.expiryYear.maxLength || errors.push('Maximum length')
      this.$v.expiryYear.minValue || errors.push('Invalid input')

      return errors
    },
    /**
     * Error messages for cvv.
     */
    cvvErrors () {
      const errors = []

      if (!this.$v.cvv.$dirty) return errors

      this.$v.cvv.requiredIf || errors.push('Required')
      this.$v.cvv.maxLength || errors.push('Maximum length')
      this.$v.cvv.minValue || errors.push('Invalid input')

      return errors
    }
  },
  methods: {
    ...mapActions('billing', { addBilling: 'addItem', updateBilling: 'updateItem' }),
    ...mapActions('dialog', ['openDialog']),
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * on edit event
     */
    onEdit (id) {
      const item = this.items.find((el) => el.id === id)

      this.id = id

      this.dialog = true

      this.name = item.name
      this.bank = item.bank
      this.cardNumber = item.cardNumber
      this.cardHolder = item.cardHolder
      this.expiryMonth = item.expiryMonth
      this.expiryYear = item.expiryYear
      this.cvv = item.cvv
    },
    /**
     * On cancel event.
     */
    onCancel () {
      this.$v.$reset()

      this.id = null

      this.dialog = false

      this.name = null
      this.bank = null
      this.cardHolder = null
      this.cardNumber = null
      this.expiryMonth = null
      this.expiryYear = null
      this.cvv = null
    },
    /**
     * On submit event.
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const params = {
          name: this.name,
          bank: this.bank,
          cardHolder: this.cardHolder,
          cardNumber: this.cardNumber,
          expiryMonth: this.expiryMonth,
          expiryYear: this.expiryYear,
          cvv: this.cvv
        }

        if (this.id) {
          this.updateBilling({
            ...params,
            id: this.id,
            name: (params.name) ? params.name.trim() : `Billing ${this.id}`
          })

          this.showSnackbar({ message: 'Updated successfully' })
        } else {
          this.addBilling({ ...params })
          this.showSnackbar({ message: 'Created successfully' })
        }

        this.onCancel()
      }
    }
  },
  validations: {
    bank: { required },
    cardHolder: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      })
    },
    cardNumber: { required },
    expiryMonth: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      }),
      maxLength: maxLength(2),
      maxValue: maxValue(12),
      minValue: minValue(1)
    },
    expiryYear: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      }),
      maxLength: maxLength(4),
      minValue: minValue(1000)
    },
    cvv: {
      minValue: minValue(0),
      maxLength: maxLength(3),
      requiredIf: requiredIf(function () {
        return !this.isGcash
      })
    }
  }
}
</script>
