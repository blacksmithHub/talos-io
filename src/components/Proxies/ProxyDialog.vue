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
            v-text="`${header} Proxy List`"
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
              placeholder="ip:port:username:password OR ip:port"
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
import { required } from 'vuelidate/lib/validators'

import Constant from '@/config/constant'

export default {
  data () {
    return {
      dialog: false,
      name: null,
      proxies: null,
      list: [],
      id: null
    }
  },
  computed: {
    ...mapState('proxy', ['items']),

    /**
     * Set modal header.
     */
    header () {
      return this.id ? 'Edit' : 'New'
    },
    /**
     * Error messages for proxies.
     */
    proxiesErrors () {
      const errors = []

      if (!this.$v.proxies.$dirty) return errors

      this.$v.proxies.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    list () {
      if (this.list.length) this.setProxies()
    }
  },
  methods: {
    ...mapActions('proxy', { addProxy: 'addItem', updateProxy: 'updateItem' }),
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * on edit event
     */
    onEdit (id) {
      const item = this.items.find((el) => el.id === id)

      this.dialog = true
      this.name = item.name
      this.list = item.proxies
      this.id = id

      this.setProxies()
    },
    /**
     * set all proxies
     */
    setProxies () {
      this.proxies = []

      const list = this.list.slice().map((val) => {
        let ip = `${val.host}:${val.port}`

        if (val.username && val.password) {
          ip = `${ip}:${val.username}:${val.password}`
        }

        return ip
      })

      this.proxies = list.join('\n')
    },
    /**
     * On cancel event.
     */
    onCancel () {
      this.$v.$reset()

      this.dialog = false
      this.name = null
      this.proxies = null
      this.pool = []
      this.id = null
    },
    /**
     * On submit event.
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const params = {
          name: this.name,
          proxies: this.list
        }

        if (this.id) {
          this.updateProxy({
            ...params,
            id: this.id,
            configs: [],
            status: Constant.STATUS.STOPPED,
            loading: false,
            name: (params.name) ? params.name.trim() : `Proxy List ${this.id}`
          })

          this.showSnackbar({ message: 'Updated successfully' })
        } else {
          this.addProxy({ ...params })
          this.showSnackbar({ message: 'Created successfully' })
        }

        this.onCancel()
      }
    },
    /**
     * on change event
     */
    onChange () {
      let proxies = this.proxies.split('\n')
      this.list = []

      proxies = proxies.map(element => {
        const proxy = element.split(':')

        switch (proxy.length) {
          case 4:
            this.list.push({
              host: proxy[0],
              port: proxy[1],
              username: proxy[2],
              password: proxy[3],
              proxy: `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`
            })
            break

          case 2:
            this.list.push({
              host: proxy[0],
              port: proxy[1],
              proxy: `http://${proxy[0]}:${proxy[1]}`
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
    }
  },
  validations: {
    proxies: { required }
  }
}
</script>
