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
            v-text="`${header} Bank`"
          />
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="nickname"
                  label="Nickname (optional)"
                  outlined
                  dense
                  hide-details
                  autocomplete="off"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="bank"
                  label="Bank"
                  outlined
                  dense
                  hide-details
                  autocomplete="off"
                  :error-messages="bankErrors"
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
                <v-row>
                  <v-col class="pt-0 pb-0">
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

                  <v-col class="pt-0 pb-0">
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
                </v-row>
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
import { mapActions } from 'vuex'
import { required, maxLength, requiredIf, maxValue, minValue } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dialog: false,
      isEditMode: false,
      selectedBank: {},
      nickname: '',
      bank: '',
      cardHolder: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    }
  },
  computed: {
    /**
     * Set modal header.
     *
     */
    header () {
      return this.isEditMode ? 'Edit' : 'New'
    },
    /**
     * Identify if bank is gcash.
     *
     */
    isGcash () {
      return (this.bank.toLowerCase() === 'gcash')
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

      return errors
    },
    /**
     * Error messages for expiryMonth.
     *
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
     *
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
     *
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
    ...mapActions('bank', { addBank: 'addItem', updateBank: 'updateItem' }),

    /**
     * Map selected bank.
     *
     */
    mapData (bank) {
      if (Object.keys(bank).length) {
        this.selectedBank = bank

        this.bank = bank.bank
        this.nickname = bank.nickname
        this.cardNumber = bank.cardNumber
        this.cardHolder = bank.cardHolder
        this.expiryMonth = bank.expiryMonth
        this.expiryYear = bank.expiryYear
        this.cvv = bank.cvv

        this.isEditMode = true
        this.dialog = true
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.$v.$reset()

      this.nickname = ''
      this.bank = ''
      this.cardHolder = ''
      this.cardNumber = ''
      this.expiryMonth = ''
      this.expiryYear = ''
      this.cvv = ''
      this.selectedBank = {}

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
        const params = {
          nickname: this.nickname,
          bank: this.bank,
          cardHolder: this.cardHolder,
          cardNumber: this.cardNumber,
          expiryMonth: this.expiryMonth,
          expiryYear: this.expiryYear,
          cvv: this.cvv
        }

        if (this.isEditMode) {
          this.updateBank({
            id: this.selectedBank.id,
            ...params
          })
        } else {
          this.addBank({ ...params })
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
