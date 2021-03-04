<template>
  <v-app>
    <SystemBar :headers="false" />
    <v-main>
      <v-container class="fill-height text-center">
        <v-row
          no-gutters
          justify="center"
          align="center"
        >
          <v-col
            cols="8"
            align-self="center"
            class="text-center mb-5"
          >
            <v-row
              no-gutters
              justify="center"
              class="mb-3"
            >
              <v-col
                align-self="center"
                cols="4"
              >
                <v-img
                  :src="require('@/assets/talos.png')"
                  contain
                  width="100"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col
            cols="12"
            align-self="center"
            class="pl-5 pr-5"
          >
            <v-text-field
              v-model="key"
              outlined
              label="Key"
              dense
              append-icon="mdi-key-variant"
              :loading="loading"
              :error-messages="(keyErrors.length) ? keyErrors : error"
              hide-details="auto"
              @click:append="login"
              @blur="$v.key.$touch()"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { ipcRenderer } from 'electron'

import AuthAPI from '@/api/auth'
import AuthService from '@/services/auth'
import SystemBar from '@/components/App/SystemBar'

export default {
  components: { SystemBar },
  data () {
    return {
      loading: false,
      user: {},
      key: '',
      error: ''
    }
  },
  computed: {
    keyErrors () {
      const errors = []

      if (!this.$v.key.$dirty) return errors

      this.$v.key.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    key () {
      this.error = ''
    }
  },
  methods: {
    ...mapActions('core', ['setDialogComponent', 'setDialog']),

    login () {
      try {
        this.$v.$touch()

        if (!this.$v.$invalid) {
          this.loading = true

          AuthAPI.login({ key: this.key })
            .then(({ data }) => {
              this.loading = false

              if (data) {
                AuthService.setAuth({ key: this.key })
                this.close()
              } else {
                this.error = 'Invalid key'
              }
            })
            .catch(() => {
              this.loading = false
              this.error = 'Invalid key'
            })
        }
      } catch (error) {
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
      }
    },

    close () {
      this.$v.$reset()

      this.key = ''
      this.error = ''
      this.loading = false

      ipcRenderer.send('login')
    }
  },
  validations: {
    key: { required }
  }
}
</script>
