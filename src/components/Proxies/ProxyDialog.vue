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
              v-text="`${header} Proxy Pool`"
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
                label="Pool name (optional)"
                required
                outlined
                dense
                autocomplete="off"
              />

              <v-textarea
                v-model="proxies"
                label="Proxies"
                required
                outlined
                dense
                hint="Insert proxy per line"
                autocomplete="off"
                auto-grow
                :error-messages="proxiesErrors"
                placeholder="ip:port:username:password"
                @blur="$v.proxies.$touch()"
                @change="onChange"
              />
            </v-container>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-container class="text-right">
              <v-btn
                rounded
                class="primary mr-2"
                depressed
                small
                @click="onCancel"
                v-text="'close'"
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
      Proxy successfully {{ snackbarContent }}

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
import { required } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      snackbarContent: 'created',
      snackbar: false,
      dialog: false,
      isEditMode: false,
      name: '',
      proxies: '',
      pool: [],
      selectedProxy: {}
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
     * Error messages for proxies.
     *
     */
    proxiesErrors () {
      const errors = []

      if (!this.$v.proxies.$dirty) return errors

      this.$v.proxies.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    pool () {
      if (this.pool.length) this.setProxies()
    }
  },
  methods: {
    ...mapActions('proxy', { addProxy: 'addItem', updateProxy: 'updateItem' }),
    ...mapActions('core', ['setDialogComponent', 'setDialog']),

    /**
     * set all proxies
     */
    setProxies () {
      this.proxies = []

      const pool = this.pool.slice().map((val) => {
        let ip = `${val.host}:${val.port}`

        if (val.username && val.password) {
          ip = `${ip}:${val.username}:${val.password}`
        }

        return ip
      })

      this.proxies = pool.join('\n')
    },
    /**
     * Map selected proxy.
     *
     */
    mapData (proxy) {
      if (Object.keys(proxy).length) {
        this.selectedProxy = proxy

        this.name = proxy.name
        this.pool = proxy.proxies

        this.setProxies()

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
      this.proxies = ''
      this.pool = []
      this.selectedProxy = {}

      this.isEditMode = false
      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      try {
        this.$v.$touch()

        if (!this.$v.$invalid) {
          const params = {
            name: this.name.trim(),
            proxies: this.pool
          }

          if (this.isEditMode) {
            this.updateProxy({
              ...params,
              name: this.name.trim() || this.selectedProxy.name,
              id: this.selectedProxy.id
            })

            this.snackbarContent = 'updated'
            this.snackbar = true
            this.onCancel()
          } else {
            this.addProxy({ ...params })
            this.snackbarContent = 'created'
            this.snackbar = true
          }
        }
      } catch (error) {
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
      }
    },
    /**
     * on change event
     */
    onChange () {
      try {
        let proxies = this.proxies.split('\n')
        this.pool = []

        proxies = proxies.map(element => {
          const proxy = element.split(':')

          switch (proxy.length) {
            case 4:
              this.pool.push({
                host: proxy[0],
                port: proxy[1],
                username: proxy[2],
                password: proxy[3]
              })
              break

            case 2:
              this.pool.push({
                host: proxy[0],
                port: proxy[1]
              })
              break

            default:
              element = ''
              break
          }

          return element
        })

        if (proxies.length) {
          proxies = proxies.filter((val) => val)
          this.proxies = proxies.join('\n')
        }
      } catch (error) {
        this.setDialogComponent({ header: 'Error', content: error })
        this.setDialog(true)
      }
    }
  },
  validations: {
    proxies: { required }
  }
}
</script>
