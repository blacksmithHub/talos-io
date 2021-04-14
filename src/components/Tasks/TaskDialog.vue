<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="900px"
  >
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title style="border-bottom:1px solid #d85820">
          <span
            class="headline primary--text"
            v-text="`${header} Task`"
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
                <v-row>
                  <v-col>
                    <v-autocomplete
                      v-model="account"
                      required
                      :error-messages="accountErrors"
                      clearable
                      :items="accounts"
                      outlined
                      dense
                      label="Account"
                      item-text="name"
                      return-object
                      :disabled="isRunning"
                      hide-details="auto"
                      @blur="$v.account.$touch()"
                    />
                  </v-col>

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
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col>
                    <v-autocomplete
                      v-model="proxy"
                      required
                      :items="allProxies"
                      outlined
                      dense
                      label="Proxy List"
                      item-text="name"
                      return-object
                      :error-messages="proxyErrors"
                      hide-details="auto"
                      @blur="$v.proxy.$touch()"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-select
                      v-model="mode"
                      required
                      dense
                      :items="modes"
                      return-object
                      item-text="label"
                      label="Mode"
                      outlined
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col>
                    <v-select
                      v-model="checkoutMethod"
                      required
                      dense
                      :items="checkoutMethods"
                      return-object
                      item-text="label"
                      label="Checkout Method"
                      outlined
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="sku"
                      label="Product SKU"
                      required
                      outlined
                      dense
                      :error-messages="skuErrors"
                      autocomplete="off"
                      hide-details="auto"
                      @blur="$v.sku.$touch()"
                    />
                  </v-col>

                  <v-col>
                    <v-text-field
                      v-model="qty"
                      dense
                      outlined
                      type="number"
                      :error-messages="qtyErrors"
                      label="Quantity"
                      required
                      hide-details="auto"
                      @blur="$v.qty.$touch()"
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
                      :error-messages="sizesErrors"
                      hint="Press Enter per input to apply"
                      hide-details="auto"
                      @blur="$v.sizes.$touch()"
                      @input="filterSizes"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-divider vertical />

              <v-col cols="5">
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="delay"
                      dense
                      outlined
                      type="number"
                      :error-messages="delayErrors"
                      label="Retry Delay (ms)"
                      hide-details="auto"
                      @blur="$v.delay.$touch()"
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

                <v-list dense>
                  <v-list-item
                    class="pa-0"
                    dense
                  >
                    <v-list-item-content class="pa-2">
                      <v-list-item-title v-text="'Auto Pay'" />
                      <v-list-item-subtitle v-text="'Submit payment automatically'" />
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-switch
                        v-model="autoPay"
                        inset
                      />
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item
                    class="pa-0"
                    dense
                  >
                    <v-list-item-content class="pa-2">
                      <v-list-item-title v-text="'Auto Fill'" />

                      <v-list-item-subtitle v-text="'Fill up billing details automatically'" />
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-switch
                        v-model="autoFill"
                        inset
                      />
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
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
import { required, minValue } from 'vuelidate/lib/validators'

import Constant from '@/config/constant'

export default {
  data () {
    return {
      id: null,

      dialog: false,
      placeOrderMenu: false,

      autoPay: false,
      autoFill: true,

      sku: null,
      account: null,
      billing: null,
      placeOrder: null,

      sizes: [],
      delay: 3500,
      qty: 1,
      mode: Constant.CLIENT[0],
      checkoutMethod: Constant.METHODS[3],
      proxy: { id: null, name: 'Localhost' }
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('account', { accounts: 'items' }),
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
     * Is task running
     */
    isRunning () {
      let data = false

      if (this.tasks.length && this.id) {
        const task = this.tasks.find((val) => val.id === this.id)
        data = (task && task.status.id === Constant.STATUS.RUNNING)
      }

      return data
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
     * Set modal header.
     */
    header () {
      return this.id ? 'Edit' : 'New'
    },
    /**
     * Error messages for account.
     */
    accountErrors () {
      const errors = []

      if (!this.$v.account.$dirty) return errors

      this.$v.account.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for sku.
     */
    skuErrors () {
      const errors = []

      if (!this.$v.sku.$dirty) return errors

      this.$v.sku.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for sizes.
     */
    sizesErrors () {
      const errors = []

      if (!this.$v.sizes.$dirty) return errors

      this.$v.sizes.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for delay.
     */
    delayErrors () {
      const errors = []

      if (!this.$v.delay.$dirty) return errors

      this.$v.delay.minValue || errors.push('Invalid input')
      this.$v.delay.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for qty.
     */
    qtyErrors () {
      const errors = []

      if (!this.$v.qty.$dirty) return errors

      this.$v.qty.minValue || errors.push('Invalid input')
      this.$v.qty.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for proxy.
     */
    proxyErrors () {
      const errors = []

      if (!this.$v.proxy.$dirty) return errors

      this.$v.proxy.required || errors.push('Required')

      return errors
    }
  },
  watch: {
    autoPay () {
      if (this.autoPay) this.autoFill = false
    },
    autoFill () {
      if (this.autoFill) this.autoPay = false
    }
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem', updateTask: 'updateItem' }),
    ...mapActions('snackbar', ['showSnackbar']),

    /**
     * On edit event
     */
    onEdit (id) {
      const item = this.tasks.find((el) => el.id === id)

      this.id = id

      this.dialog = true
      this.placeOrderMenu = false

      this.autoPay = item.autoPay
      this.autoFill = item.autoFill

      this.sku = item.sku
      this.account = item.account
      this.billing = item.billing
      this.placeOrder = item.placeOrder
      this.sizes = item.sizes
      this.delay = item.delay
      this.qty = item.qty
      this.mode = item.mode
      this.checkoutMethod = item.checkoutMethod
      this.proxy = item.proxy || { id: null, name: 'Localhost' }
    },
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

      this.id = null

      this.dialog = false
      this.placeOrderMenu = false

      this.autoPay = false
      this.autoFill = true

      this.sku = null
      this.account = null
      this.billing = null
      this.placeOrder = null

      this.sizes = []
      this.delay = 3500
      this.qty = 1
      this.mode = Constant.CLIENT[0]
      this.checkoutMethod = Constant.METHODS[3]
      this.proxy = { id: null, name: 'Localhost' }
    },
    /**
     * On submit event.
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const params = {
          sku: this.sku,
          account: this.account,
          proxy: (this.proxy.id) ? this.proxy : null,
          billing: this.billing,
          placeOrder: this.placeOrder,

          sizes: this.sizes,
          delay: this.delay,
          qty: this.qty,
          mode: this.mode,
          checkoutMethod: this.checkoutMethod,

          autoPay: this.autoPay,
          autoFill: this.autoFill
        }

        if (this.id) {
          this.updateTask({
            ...params,
            id: this.id
          })

          this.showSnackbar({ message: 'Updated successfully' })
        } else {
          this.addTask(params)
          this.showSnackbar({ message: 'Created successfully' })
        }

        this.onCancel()
      }
    }
  },
  validations: {
    account: { required },
    proxy: { required },
    sku: { required },
    sizes: { required },
    delay: {
      required,
      minValue: minValue(0)
    },
    qty: {
      required,
      minValue: minValue(1)
    }
  }
}
</script>
