<template>
  <v-container>
    <v-tabs
      class="mt-5"
      grow
    >
      <v-tab
        v-for="(tab, index) in tabs"
        :key="index"
        v-text="tab"
      />

      <v-tab-item
        v-for="n in tabs.length"
        :key="n"
      >
        <v-container>
          <UserList v-if="n === 1" />
          <BankList v-else />
        </v-container>
      </v-tab-item>
    </v-tabs>

    <!-- <UserDialog />
    <BankDialog /> -->
  </v-container>
</template>

<script>
import UserList from '@/components/Profiles/UserList'
import BankList from '@/components/Profiles/BankList'
// import UserDialog from '@/components/Profiles/UserDialog'
// import BankDialog from '@/components/Profiles/BankDialog'

export default {
  components: {
    UserList,
    BankList
    // UserDialog,
    // BankDialog
  },
  data () {
    return {
      tabs: ['Users', 'Banks']
    }
  }
}
</script>
