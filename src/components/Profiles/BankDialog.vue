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
import { required, numeric, maxLength, requiredIf } from 'vuelidate/lib/validators'

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
      expiry: '',
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
      this.$v.number.numeric || errors.push('Accepts only numerics')

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
        this.expiry = bank.expiry
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
      this.expiry = ''
      this.cvv = ''

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
          expiry: this.expiry,
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
    number: {
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
