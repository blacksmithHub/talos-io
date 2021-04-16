<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="500px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title style="border-bottom:1px solid #d85820">
          <span
            class="headline primary--text"
            v-text="'Edit All'"
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
              <v-col>
                <v-autocomplete
                  v-model="billing"
                  clearable
                  :items="billings"
                  outlined
                  dense
                  label="Billing"
                  item-text="name"
                  return-object
                  hide-details
                />
              </v-col>

              <v-col>
                <v-autocomplete
                  v-model="proxy"
                  :items="allProxies"
                  outlined
                  dense
                  label="Proxy List"
                  item-text="name"
                  return-object
                  hide-details
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-select
                  v-model="mode"
                  dense
                  :items="modes"
                  return-object
                  item-text="label"
                  label="Mode"
                  outlined
                  hide-details
                />
              </v-col>

              <v-col>
                <v-select
                  v-model="checkoutMethod"
                  dense
                  :items="checkoutMethods"
                  return-object
                  item-text="label"
                  label="Checkout Method"
                  outlined
                  hide-details
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="sku"
                  label="Product SKU"
                  outlined
                  dense
                  autocomplete="off"
                  hide-details
                />
              </v-col>

              <v-col>
                <v-text-field
                  v-model="qty"
                  dense
                  outlined
                  type="number"
                  label="Quantity"
                  hide-details
                />
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="sizes"
                  chips
                  small-chips
                  deletable-chips
                  clearable
                  label="Size"
                  multiple
                  outlined
                  dense
                  append-icon=""
                  hint="Press Enter per input to apply"
                  hide-details
                  @input="filterSizes"
                />
              </v-col>

              <v-col>
                <v-text-field
                  v-model="delay"
                  dense
                  outlined
                  type="number"
                  label="Retry Delay (ms)"
                  hide-details
                />
              </v-col>

              <v-col>
                <v-menu
                  ref="placeOrderMenu"
                  v-model="placeOrderMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="placeOrder"
                  transition="scale-transition"
                  offset-y
                  max-width="350px"
                  min-width="350px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="placeOrder"
                      dense
                      outlined
                      readonly
                      v-bind="attrs"
                      clearable
                      label="Place Order"
                      hide-details
                      v-on="on"
                    />
                  </template>
                  <v-time-picker
                    v-if="placeOrderMenu"
                    v-model="placeOrder"
                    full-width
                    ampm-in-title
                    format="ampm"
                    use-seconds
                    color="primary"
                    @click:second="$refs.placeOrderMenu.save(placeOrder)"
                  />
                </v-menu>
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
import { minValue } from 'vuelidate/lib/validators'

import Constant from '@/config/constant'

export default {
  props: {
    selected: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      dialog: false,
      placeOrderMenu: false,

      sku: null,
      billing: null,
      placeOrder: null,
      delay: null,
      qty: null,
      mode: null,
      checkoutMethod: null,
      proxy: null,
      sizes: []
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('billing', { billings: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),

    /**
     * Return all modes
     */
    modes () {
      return Constant.CLIENT
    },
    /**
     * Return all attributes
     */
    attributes () {
      return Constant.TITAN_ATTRIBUTES
    },
    /**
     * return available checkout methods
     */
    checkoutMethods () {
      return Constant.METHODS
    },
    /**
     * Return all proxies
     */
    allProxies () {
      const proxies = this.proxies.slice()

      proxies.unshift({ id: null, name: 'Localhost' })

      return proxies
    },
    /**
     * Error messages for delay.
     */
    delayErrors () {
      const errors = []

      if (!this.$v.delay.$dirty) return errors

      this.$v.delay.minValue || errors.push('Invalid input')

      return errors
    },
    /**
     * Error messages for qty.
     */
    qtyErrors () {
      const errors = []

      if (!this.$v.qty.$dirty) return errors

      this.$v.qty.minValue || errors.push('Invalid input')

      return errors
    }
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * Filter input sizes.
     */
    filterSizes () {
      if (this.sizes.length) {
        const sizes = []

        this.sizes.forEach(element => {
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase()))

          if (attr && !sizes.find((val) => val.toLowerCase() === element.toLowerCase())) sizes.push(element)
        })

        this.sizes = sizes
      }
    },
    /**
     * On cancel event.
     */
    onCancel () {
      this.$v.$reset()

      this.dialog = false
      this.placeOrderMenu = false

      this.sku = null
      this.billing = null
      this.placeOrder = null
      this.delay = null
      this.qty = null
      this.mode = null
      this.checkoutMethod = null
      this.proxy = null
      this.sizes = []
    },
    /**
     * On submit event.
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const params = {}

        if (this.sku) params.sku = this.sku

        if (this.proxy) params.proxy = this.proxy

        if (this.billing) params.billing = this.billing

        if (this.placeOrder) params.placeOrder = this.placeOrder

        if (this.sizes.length) {
          const sizes = []

          this.sizes.forEach((element) => {
            const attr = this.attributes.find((val) => val.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase()))

            const size = attr.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase())

            sizes.push({
              attribute_id: attr.attribute_id,
              value: size.value,
              label: size.label
            })
          })

          params.sizes = sizes
        }

        if (this.delay) params.delay = this.delay

        if (this.qty) params.qty = this.qty

        if (this.mode) params.mode = this.mode

        if (this.checkoutMethod) params.checkoutMethod = this.checkoutMethod

        const data = (this.selected.length) ? this.selected : this.tasks
        data.forEach(el => {
          const opt = { deviceCategory: 'desktop' }

          if (this.mode && this.mode.id !== el.mode.id && this.mode.id !== 1) opt.deviceCategory = 'mobile'

          if (this.proxy && (this.proxy.id !== el.proxy.id || !this.proxy.id)) {
            const UserAgent = require('user-agents')
            let userAgent = new UserAgent(opt)
            userAgent = userAgent.toString()

            if (this.proxy.id) {
              params.proxy.configs = params.proxy.configs.map(el => {
                return {
                  ...el,
                  userAgent: userAgent
                }
              })
            } else {
              const rp = require('request-promise')
              const jar = rp.jar()

              params.proxy.configs = [{
                rp: rp,
                jar: jar,
                userAgent: userAgent
              }]
            }
          }

          this.updateTask({
            ...el,
            ...params
          })
        })

        this.showSnackbar({ message: 'Updated successfully', color: 'teal' })
        this.onCancel()
      }
    }
  },
  validations: {
    delay: { minValue: minValue(0) },
    qty: { minValue: minValue(1) }
  }
}
</script>
