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
            class="text-center"
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
                  :src="require('@/assets/icon.png')"
                  contain
                  width="100"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col
            v-if="Object.keys(user).length"
            cols="12"
            align-self="center"
          >
            <v-btn
              :loading="loading"
              small
              rounded
              @click="authenticate"
            >
              login in with discord
            </v-btn>
          </v-col>

          <v-col
            v-else
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
              :error-messages="(keyErrors.length) ? keyErrors : apiValidation"
              hide-details="auto"
              @click:append="bind"
              @blur="$v.key.$touch()"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

import AuthAPI from '@/api/auth'
import auth from '@/services/auth'
import SystemBar from '@/components/App/SystemBar'
import { ipcRenderer } from 'electron'

export default {
  components: { SystemBar },
  data () {
    return {
      loading: false,
      user: {},
      key: '',
      apiValidation: []
    }
  },
  computed: {
    /**
     * Error messages for key.
     *
     */
    keyErrors () {
      const errors = []

      if (!this.$v.key.$dirty) return errors

      this.$v.key.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    key () {
      this.apiValidation = []
    }
  },
  methods: {
    /**
     * Bind master key
     */
    async bind () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.loading = true

        await AuthAPI.bind({
          discord_id: 123,
          key: this.key
        })
          .then((response) => {
            switch (response.status) {
              case 200: {
                const data = {
                  ...this.user,
                  key: this.key
                }

                auth.setAuth(JSON.stringify(data))

                this.key = ''
                this.user = {}
                this.apiValidation = []

                this.$v.$reset()

                ipcRenderer.send('bind')

                break
              }

              case 422:
                this.apiValidation.push(response.data.errors.key[0])

                break
            }

            this.loading = false
          })
      }
    }
  },
  validations: {
    key: { required }
  }
}
</script>
