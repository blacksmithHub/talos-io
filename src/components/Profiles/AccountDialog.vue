<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="700px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title style="border-bottom:1px solid #d85820">
          <span
            class="headline primary--text"
            v-text="`${header} Account`"
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
            <v-text-field
              v-model="name"
              label="Name (optional)"
              required
              outlined
              dense
              autocomplete="off"
            />

            <br>

            <v-row>
              <v-col cols="6">
                <p v-text="'Titan 22 Login'" />

                <v-text-field
                  v-model="t22Email"
                  label="Email"
                  required
                  outlined
                  dense
                  :error-messages="t22EmailErrors"
                  autocomplete="off"
                  @blur="$v.t22Email.$touch()"
                />

                <v-text-field
                  v-model="t22Password"
                  label="Password"
                  required
                  :type="t22ShowPassword ? 'text' : 'password'"
                  outlined
                  dense
                  :error-messages="t22PasswordErrors"
                  autocomplete="off"
                  :append-icon="t22ShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @blur="$v.t22Password.$touch()"
                  @click:append="t22ShowPassword = !t22ShowPassword"
                />
              </v-col>

              <v-divider vertical />

              <v-col cols="6">
                <p v-text="'PayPal Login'" />

                <v-text-field
                  v-model="ppEmail"
                  label="Email"
                  required
                  outlined
                  dense
                  :error-messages="ppEmailErrors"
                  autocomplete="off"
                  :disabled="sameAs"
                  @blur="$v.ppEmail.$touch()"
                />

                <v-text-field
                  v-model="ppPassword"
                  label="Password"
                  required
                  :type="ppShowPassword ? 'text' : 'password'"
                  outlined
                  dense
                  hide-details="auto"
                  autocomplete="off"
                  :append-icon="ppShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :disabled="sameAs"
                  @click:append="ppShowPassword = !ppShowPassword"
                />

                <v-checkbox
                  v-model="sameAs"
                  color="warning"
                  dense
                >
                  <template v-slot:label>
                    <small v-text="'Same as Titan 22 Credentials'" />
                  </template>
                </v-checkbox>
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
import { required, email } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      id: null,

      dialog: false,
      t22ShowPassword: false,
      ppShowPassword: false,
      sameAs: false,

      name: null,
      t22Email: null,
      t22Password: null,

      ppEmail: null,
      ppPassword: null
    }
  },
  computed: {
    ...mapState('account', ['items']),

    /**
     * Set modal header.
     */
    header () {
      return this.id ? 'Edit' : 'New'
    },
    /**
     * Error messages for t22Email.
     */
    t22EmailErrors () {
      const errors = []

      if (!this.$v.t22Email.$dirty) return errors

      this.$v.t22Email.required || errors.push('Required')
      this.$v.t22Email.email || errors.push('Invalid email')

      return errors
    },
    /**
     * Error messages for t22Password.
     */
    t22PasswordErrors () {
      const errors = []

      if (!this.$v.t22Password.$dirty) return errors

      this.$v.t22Password.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for ppEmail.
     */
    ppEmailErrors () {
      const errors = []

      if (!this.$v.ppEmail.$dirty) return errors

      this.$v.ppEmail.email || errors.push('Invalid email')

      return errors
    }
  },
  watch: {
    sameAs () {
      if (this.sameAs) {
        this.ppEmail = this.t22Email
        this.ppPassword = this.t22Password
      }
    },
    t22Email () {
      if (this.sameAs) this.ppEmail = this.t22Email
    },
    t22Password () {
      if (this.sameAs) this.ppPassword = this.t22Password
    }
  },
  methods: {
    ...mapActions('account', { addAccount: 'addItem', updateAccount: 'updateItem' }),
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * On edit event
     */
    onEdit (id) {
      const item = this.items.find((el) => el.id === id)

      this.id = id

      this.dialog = true
      this.t22ShowPassword = false
      this.ppShowPassword = false
      this.sameAs = item.sameAs

      this.name = item.name
      this.t22Email = item.email
      this.t22Password = item.password

      this.ppEmail = item.paypal.email
      this.ppPassword = item.paypal.password
    },
    /**
     * On cancel event.
     */
    onCancel () {
      this.$v.$reset()

      this.id = null

      this.name = null
      this.t22Email = null
      this.t22Password = null

      this.ppEmail = null
      this.ppPassword = null

      this.dialog = false
      this.t22ShowPassword = false
      this.ppShowPassword = false
      this.sameAs = false
    },
    /**
     * On submit event.
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const params = {
          name: this.name,
          email: this.t22Email,
          password: this.t22Password,
          sameAs: this.sameAs,
          paypal: {
            email: this.ppEmail,
            password: this.ppPassword
          },
          loading: false
        }

        if (this.id) {
          this.updateAccount({
            ...params,
            id: this.id,
            name: (params.name) ? params.name.trim() : `Account ${this.id}`
          })

          this.showSnackbar({ message: 'Updated successfully', color: 'teal' })
        } else {
          this.addAccount(params)
          this.showSnackbar({ message: 'Created successfully', color: 'teal' })
        }

        this.onCancel()
      }
    }
  },
  validations: {
    t22Email: {
      required,
      email
    },
    t22Password: { required },
    ppEmail: { email }
  }
}
</script>
