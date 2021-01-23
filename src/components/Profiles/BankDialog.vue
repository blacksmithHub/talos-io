<template>
  <div>
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
              v-text="`${header} Bank`"
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

          <v-divider />

          <v-card-actions>
            <v-container class="text-right">
              <v-btn
                rounded
                class="primary mr-2"
                small
                depressed
                @click="onCancel"
                v-text="'Close'"
              />
              <v-btn
                class="primary"
                rounded
                type="submit"
                small
                depressed
                v-text="'Save'"
              />
            </v-container>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-snackbar v-model="snackbar">
      Bank successfully {{ snackbarContent }}

      <template v-slot:action="{ attrs }">
        <v-btn
          icon
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon v-text="'mdi-close'" />
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { required, maxLength, requiredIf, maxValue, minValue } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      snackbarContent: 'created',
      snackbar: false,
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

      this.isEditMode = false
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const params = {
          nickname: this.nickname.trim(),
          bank: this.bank.trim(),
          cardHolder: this.cardHolder.trim(),
          cardNumber: this.cardNumber,
          expiryMonth: this.expiryMonth,
          expiryYear: this.expiryYear,
          cvv: this.cvv
        }

        if (this.isEditMode) {
          this.updateBank({
            ...params,
            nickname: this.nickname.trim() || this.selectedBank.nickname,
            id: this.selectedBank.id
          })

          this.snackbarContent = 'updated'
          this.snackbar = true
          this.onCancel()
        } else {
          this.addBank({ ...params })
          this.snackbarContent = 'created'
          this.snackbar = true
        }
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
