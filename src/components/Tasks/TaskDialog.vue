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
                  <v-autocomplete
                    v-model="profile"
                    required
                    :error-messages="profileErrors"
                    clearable
                    :items="profiles"
                    outlined
                    dense
                    label="Profile"
                    item-text="name"
                    return-object
                    :disabled="isRunning"
                    hide-details="auto"
                    @blur="$v.profile.$touch()"
                  />
                </v-col>

                <v-col>
                  <v-autocomplete
                    v-model="bank"
                    clearable
                    :items="banks"
                    outlined
                    dense
                    label="Bank"
                    item-text="nickname"
                    return-object
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="proxy"
                    required
                    :items="allProxies"
                    outlined
                    dense
                    label="Proxies"
                    item-text="name"
                    return-object
                    :error-messages="proxyErrors"
                    hide-details="auto"
                    @blur="$v.proxy.$touch()"
                  />
                </v-col>

                <v-col>
                  <v-select
                    v-model="mode"
                    required
                    dense
                    :items="modes"
                    label="Mode"
                    outlined
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="sku"
                    label="SKU"
                    required
                    outlined
                    dense
                    :error-messages="skuErrors"
                    autocomplete="off"
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
                    @blur="$v.qty.$touch()"
                  />
                </v-col>
              </v-row>

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
                :error-messages="sizesErrors"
                hint="Press Enter per input to apply"
                :disabled="!sku"
                @blur="$v.sizes.$touch()"
                @input="filterSizes"
              />

              <v-row>
                <v-col>
                  <v-expansion-panels
                    v-model="panel"
                    flat
                    style="border:1px solid #d85820"
                  >
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        Advance Options
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-row>
                          <v-col>
                            <v-text-field
                              v-model="delay"
                              dense
                              outlined
                              type="number"
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

                        <p>Checkout Method:</p>
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
            <v-container class="text-right">
              <v-btn
                rounded
                small
                class="primary mr-2"
                depressed
                @click="onCancel"
                v-text="'Close'"
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
      Task successfully {{ snackbarContent }}

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
import { required, minValue, requiredIf } from 'vuelidate/lib/validators'

import Constant from '@/config/constant'

export default {
  data () {
    return {
      snackbar: false,
      snackbarContent: 'created',
      dialog: false,
      sku: '',
      sizes: [],
      profile: {},
      proxy: { id: null, name: 'Localhost', proxies: [] },
      bank: {},
      isEditMode: false,
      selectedTask: {},
      delay: 3200,
      placeOrder: '',
      placeOrderMenu: false,
      qty: 1,
      mode: 'Desktop',
      modes: ['Desktop', 'Mobile (iOS)', 'Mobile (Android)'],
      checkoutMethod: Constant.METHODS[3].id,
      panel: []
    }
  },
  computed: {
    ...mapState('task', { allTasks: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('bank', { banks: 'items' }),
    ...mapState('proxy', { proxies: 'items' }),
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

      if (this.allTasks.length && Object.keys(this.selectedTask).length) {
        const task = this.allTasks.find((val) => val.id === this.selectedTask.id)
        data = (task && task.status.id === Constant.TASK.STATUS.RUNNING)
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

      proxies.push({ id: null, name: 'Localhost', proxies: [] })

      return proxies
    },
    /**
     * Set modal header.
     *
     */
    header () {
      return this.isEditMode ? 'Edit' : 'New'
    },
    /**
     * Error messages for profile.
     *
     */
    profileErrors () {
      const errors = []

      if (!this.$v.profile.$dirty) return errors

      this.$v.profile.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for sku.
     *
     */
    skuErrors () {
      const errors = []

      if (!this.$v.sku.$dirty) return errors

      this.$v.sku.required || errors.push('Required')

      return errors
    },
    /**
     * Error messages for sizes.
     *
     */
    sizesErrors () {
      const errors = []

      if (!this.$v.sizes.$dirty) return errors

      this.$v.sizes.requiredIf || errors.push('Required')

      return errors
    },
    /**
     * Error messages for delay.
     *
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
     *
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
     *
     */
    proxyErrors () {
      const errors = []

      if (!this.$v.proxy.$dirty) return errors

      this.$v.proxy.required || errors.push('Required')

      return errors
    }
  },
  methods: {
    ...mapActions('task', { addTask: 'addItem', updateTask: 'updateItem' }),

    /**
     * Map selected task.
     *
     */
    mapData (task) {
      if (Object.keys(task).length) {
        this.selectedTask = task

        const sizes = task.sizes.slice().map((val) => val.label)

        this.sku = task.sku
        this.sizes = sizes
        this.delay = task.delay
        this.placeOrder = task.placeOrder
        this.qty = task.qty || 1
        this.proxy = task.proxy
        this.mode = task.mode || 'Desktop'
        this.checkoutMethod = task.checkoutMethod || Constant.METHODS[3].id

        this.profile = (task.profile.id) ? task.profile : {}
        this.bank = (task.bank.id) ? task.bank : {}

        this.isEditMode = true
        this.dialog = true
      }
    },
    /**
     * Filter input sizes.
     *
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
     *
     */
    onCancel () {
      this.$v.$reset()

      this.sku = ''
      this.sizes = []
      this.bank = {}
      this.profile = {}
      this.proxy = {}
      this.selectedTask = {}
      this.delay = 3200
      this.placeOrder = ''
      this.placeOrderMenu = false
      this.qty = 1
      this.mode = 'Desktop'
      this.checkoutMethod = Constant.METHODS[3].id
      this.panel = []
      this.isEditMode = false

      this.dialog = false
    },
    /**
     * On submit event.
     *
     */
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        const sizes = []

        this.sizes.forEach(element => {
          const attr = this.attributes.find((val) => val.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase()))

          const size = attr.sizes.find((data) => data.label.toLowerCase() === element.toLowerCase())

          sizes.push({
            attribute_id: attr.attribute_id,
            value: size.value,
            label: size.label
          })
        })

        const params = {
          sku: this.sku.trim(),
          sizes: sizes,
          profile: this.profile,
          proxy: this.proxy,
          bank: this.bank || {},
          delay: this.delay,
          placeOrder: this.placeOrder,
          qty: this.qty,
          mode: this.mode,
          checkoutMethod: this.checkoutMethod
        }

        if (this.isEditMode) {
          this.updateTask({
            ...this.selectedTask,
            ...params
          })

          this.snackbarContent = 'updated'
          this.snackbar = true

          this.onCancel()
        } else {
          this.addTask({ ...params })
          this.snackbarContent = 'created'
          this.snackbar = true
        }
      }
    }
  },
  validations: {
    profile: { required },
    proxy: { required },
    sku: { required },
    sizes: {
      requiredIf: requiredIf(function () {
        return this.sku
      })
    },
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
