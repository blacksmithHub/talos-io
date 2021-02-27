<template>
  <div>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-form @submit.prevent="submit">
        <v-card>
          <v-card-title style="border-bottom: 1px solid #d85820">
            <span
              class="headline primary--text"
              v-text="'Mass Edit'"
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

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="sku"
                    label="SKU"
                    outlined
                    dense
                    hide-details
                    autocomplete="off"
                  />
                </v-col>

                <v-col cols="12">
                  <v-combobox
                    v-model="sizes"
                    chips
                    small-chips
                    deletable-chips
                    clearable
                    label="Sizes"
                    multiple
                    outlined
                    dense
                    append-icon=""
                    hint="Press Enter per input to apply"
                    hide-details="auto"
                    @input="filterSizes"
                  />
                </v-col>

                <v-col cols="6">
                  <v-select
                    v-model="mode"
                    required
                    dense
                    :items="modes"
                    label="Mode"
                    outlined
                    clearable
                    hide-details
                  />
                </v-col>

                <v-col cols="6">
                  <v-autocomplete
                    v-model="proxy"
                    required
                    clearable
                    :items="allProxies"
                    outlined
                    dense
                    label="Proxies"
                    item-text="name"
                    return-object
                    hide-details
                  />
                </v-col>

                <v-col cols="12">
                  <v-expansion-panels
                    v-model="panel"
                    flat
                    style="border:1px solid #d85820"
                  >
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        Advanced
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-row>
                          <v-col>
                            <v-text-field
                              v-model="delay"
                              dense
                              outlined
                              type="number"
                              hide-details="auto"
                              :error-messages="delayErrors"
                              label="Delays"
                              hint="Input value in milliseconds"
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
                                  hide-details
                                  outlined
                                  readonly
                                  v-bind="attrs"
                                  clearable
                                  label="Place Order At"
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

                        <v-radio-group
                          v-model="checkoutMethod"
                          row
                          dense
                        >
                          <v-radio
                            v-for="(method, index) in checkoutMethods"
                            :key="index"
                            :label="method.label"
                            :value="method.id"
                          />
                        </v-radio-group>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-container>
              <v-row
                no-gutters
                align="center"
              >
                <v-col
                  cols="6"
                  align-self="center"
                >
                  <v-btn
                    class="primary"
                    rounded
                    small
                    depressed
                    @click="clearTimer"
                    v-text="'clear timer'"
                  />
                </v-col>

                <v-col
                  cols="6"
                  align-self="center"
                  class="text-right"
                >
                  <v-btn
                    class="primary mr-2"
                    rounded
                    small
                    depressed
                    @click="onCancel"
                    v-text="'close'"
                  />
                  <v-btn
                    class="primary"
                    rounded
                    type="submit"
                    depressed
                    small
                    v-text="'save'"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-snackbar v-model="snackbar">
      Tasks successfully updated

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
      snackbar: false,
      dialog: false,
      sizes: [],
      sku: '',
      delay: '',
      placeOrder: '',
      placeOrderMenu: false,
      proxy: {},
      mode: '',
      modes: ['Desktop', 'Mobile (iOS)', 'Mobile (Android)'],
      checkoutMethod: null,
      panel: []
    }
  },
  computed: {
    ...mapState('task', { tasks: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
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

      proxies.push({ id: null, name: 'Localhost', proxies: [] })

      return proxies
    },
    /**
     * Error messages for delay.
     *
     */
    delayErrors () {
      const errors = []

      if (!this.$v.delay.$dirty) return errors

      this.$v.delay.minValue || errors.push('Invalid input')

      return errors
    }
  },
  methods: {
    ...mapActions('task', { updateTask: 'updateItem' }),

    /**
     * clear timer
     */
    clearTimer () {
      this.tasks.forEach(element => {
        const params = element

        params.placeOrder = ''

        this.updateTask(params)
      })

      this.onCancel()
    },
    /**
     * Filter input sizes.
     *
     */
    filterSizes () {
      if (this.sizes.length) {
        const sizes = []

        this.sizes.forEach(element => {
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label === element))

          if (attr) sizes.push(element)
        })

        this.sizes = sizes
      }
    },
    /**
     * On cancel event.
     *
     */
    onCancel () {
      this.$v.$reset()

      this.sizes = []
      this.sku = ''
      this.delay = ''
      this.placeOrder = ''
      this.placeOrderMenu = false
      this.proxy = {}
      this.mode = ''
      this.checkoutMethod = null
      this.panel = []
      this.dialog = false
    },

    /**
     * On submit event.
     *
     */
    submit () {
      const collection = (this.selected.length) ? this.selected : this.tasks

      collection.forEach(element => {
        const params = element

        if (this.delay) params.delay = this.delay

        if (this.sku) params.sku = this.sku

        if (this.placeOrder) params.placeOrder = this.placeOrder

        if (this.proxy && Object.keys(this.proxy).length) params.proxy = this.proxy

        if (this.mode) params.mode = this.mode

        if (this.checkoutMethod) params.checkoutMethod = this.checkoutMethod

        if (this.sizes.length) {
          const sizes = []

          this.sizes.forEach(element => {
            const attr = this.attributes.find((val) => val.sizes.find((data) => data.label === element))

            const size = attr.sizes.find((data) => data.label === element)

            sizes.push({
              attribute_id: attr.attribute_id,
              value: size.value,
              label: size.label
            })
          })

          params.sizes = sizes
        }

        this.updateTask(params)
      })

      this.snackbar = true
      this.onCancel()
    }
  },
  validations: {
    delay: { minValue: minValue(0) }
  }
}
</script>
