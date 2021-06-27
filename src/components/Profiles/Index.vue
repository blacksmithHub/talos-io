<template>
  <div>
    <v-row>
      <v-col cols="7">
        <Account />
      </v-col>

      <v-col cols="5">
        <Billing />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Account from '@/components/Profiles/Account'
import Billing from '@/components/Profiles/Billing'

export default {
  components: {
    Account,
    Billing
  },
  data () {
    return {
      //
    }
  }
}
</script>
