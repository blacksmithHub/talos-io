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
            v-text="`${header} Profile`"
          />
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-text-field
              v-model="name"
              label="Profile name (optional)"
              required
              outlined
              dense
              autocomplete="off"
            />

            <v-text-field
              v-model="email"
              label="Email"
              required
              outlined
              dense
              :error-messages="emailErrors"
              autocomplete="off"
              @blur="$v.email.$touch()"
            />

            <v-text-field
              v-model="password"
              label="Password"
              required
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              :error-messages="passwordErrors"
              autocomplete="off"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @blur="$v.password.$touch()"
              @click:append="showPassword = !showPassword"
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
import { mapActions } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dialog: false,
      isEditMode: false,
      email: '',
      password: '',
      name: '',
      selectedProfile: {},
      showPassword: false
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
    }
  },
  methods: {
    ...mapActions('profile', { addProfile: 'addItem', updateProfile: 'updateItem' }),

    /**
     * Map selected profile.
     *
     */
    mapData (profile) {
      if (Object.keys(profile).length) {
        this.selectedProfile = profile

        this.name = profile.name
        this.email = profile.email
        this.password = profile.password

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

      this.name = ''
      this.email = ''
      this.password = ''
      this.selectedProfile = {}

      this.showPassword = false
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
          name: this.name.trim(),
          email: this.email,
          password: this.password.trim()
        }

        if (this.isEditMode) {
          this.updateProfile({
            id: this.selectedProfile.id,
            ...params
          })
        } else {
          this.addProfile({ ...params })
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
    password: { required }
  }
}
</script>
