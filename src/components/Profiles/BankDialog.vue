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
                  label="Nickname"
                  outlined
                  dense
                  hide-details
                  autocomplete="off"
                />
              </v-col>

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
                  v-model="holder"
                  label="Card holder"
                  required
                  outlined
                  dense
                  :error-messages="holderErrors"
                  hide-details="auto"
                  autocomplete="off"
                  @blur="$v.holder.$touch()"
                />
              </v-col>

              <v-col
                cols="12"
                :md="isGcash ? 12 : 6"
              >
                <v-text-field
                  v-model="number"
                  label="Card number"
                  required
                  outlined
                  dense
                  :error-messages="numberErrors"
                  hide-details="auto"
                  type="number"
                  autocomplete="off"
                  @blur="$v.number.$touch()"
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
                      v-model="month"
                      label="Month"
                      required
                      outlined
                      dense
                      :error-messages="monthErrors"
                      hide-details="auto"
                      type="number"
                      autocomplete="off"
                      @blur="$v.month.$touch()"
                    />
                  </v-col>

                  <v-col class="pt-0 pb-0">
                    <v-text-field
                      v-model="year"
                      label="Year"
                      required
                      outlined
                      dense
                      :error-messages="yearErrors"
                      hide-details="auto"
                      type="number"
                      autocomplete="off"
                      @blur="$v.year.$touch()"
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
import { mapState, mapActions } from 'vuex'
import { required, maxLength, requiredIf, maxValue, minValue } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dialog: false,
      isEditMode: false,
      selectedBank: {},
      nickname: '',
      bank: {},
      holder: '',
      number: '',
      month: '',
      year: '',
      cvv: ''
    }
  },
  computed: {
    ...mapState('staticBank', { availableBanks: 'items' }),

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
      return (this.bank && this.bank.id === 1)
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
     * Error messages for holder.
     *
     */
    holderErrors () {
      const errors = []

      if (!this.$v.holder.$dirty) return errors

      this.$v.holder.requiredIf || errors.push('Required')

      return errors
    },
    /**
     * Error messages for number.
     *
     */
    numberErrors () {
      const errors = []

      if (!this.$v.number.$dirty) return errors

      this.$v.number.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for month.
     *
     */
    monthErrors () {
      const errors = []

      if (!this.$v.month.$dirty) return errors

      this.$v.month.requiredIf || errors.push('Required')
      this.$v.month.maxLength || errors.push('Maximum length')
      this.$v.month.minValue || errors.push('Invalid input')
      this.$v.month.maxValue || errors.push('Invalid input')

      return errors
    },
    /**
     * Error messages for year.
     *
     */
    yearErrors () {
      const errors = []

      if (!this.$v.year.$dirty) return errors

      this.$v.year.requiredIf || errors.push('Required')
      this.$v.year.maxLength || errors.push('Maximum length')
      this.$v.year.minValue || errors.push('Invalid input')

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
        this.number = bank.number
        this.holder = bank.holder
        this.month = bank.month
        this.year = bank.year
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
      this.bank = {}
      this.holder = ''
      this.number = ''
      this.month = ''
      this.year = ''
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
          holder: this.holder,
          number: this.number,
          month: this.month,
          year: this.year,
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
    holder: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      })
    },
    number: { required },
    month: {
      requiredIf: requiredIf(function () {
        return !this.isGcash
      }),
      maxLength: maxLength(2),
      maxValue: maxValue(12),
      minValue: minValue(1)
    },
    year: {
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
