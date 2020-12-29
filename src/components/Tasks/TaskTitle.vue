<template>
  <v-card-title>
    <v-row>
      <v-col align-self="center">
        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="cyan mr-3"
          depressed
          @click="$emit('click:verifyAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-shield-search'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'verify all tasks'"
          />
        </v-btn>

        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="primary mr-3"
          depressed
          @click="$emit('click:paypalLogin')"
        >
          <vue-fontawesome
            icon="paypal"
            size="1"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            class="ml-2"
            v-text="'PayPal Login'"
          />
        </v-btn>
      </v-col>

      <v-col>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          hide-details
          outlined
          dense
          @input="onInput"
        />
      </v-col>

      <v-col
        align-self="center"
        class="text-right"
      >
        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="success mr-3"
          depressed
          @click="$emit('click:startAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-play'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'start all'"
          />
        </v-btn>

        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="warning mr-3"
          depressed
          @click="$emit('click:stopAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-stop'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'stop all'"
          />
        </v-btn>

        <v-btn
          :fab="!$vuetify.breakpoint.lgAndUp"
          :rounded="$vuetify.breakpoint.lgAndUp"
          :small="$vuetify.breakpoint.lgAndUp"
          :x-small="!$vuetify.breakpoint.lgAndUp"
          class="error"
          depressed
          @click="$emit('click:deleteAll')"
        >
          <v-icon
            :left="$vuetify.breakpoint.lgAndUp"
            :small="$vuetify.breakpoint.lgAndUp"
            v-text="'mdi-delete'"
          />
          <span
            v-if="$vuetify.breakpoint.lgAndUp"
            v-text="'delete all'"
          />
        </v-btn>
      </v-col>
    </v-row>
  </v-card-title>
</template>

<script>
export default {
  data () {
    return {
      search: ''
    }
  },
  methods: {
    /**
     * on search input event.
     */
    onInput () {
      this.$emit('input:search', this.search)
    }
  }
}
</script>
