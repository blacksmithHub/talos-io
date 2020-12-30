<template>
  <v-container>
    <v-tabs grow>
      <v-tab
        v-for="(tab, index) in tabs"
        :key="index"
        v-text="tab"
      />

      <v-tab-item
        v-for="n in tabs.length"
        :key="n"
      >
        <v-divider />

        <ProfileList v-if="n === 1" />
        <BankList v-else />
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import ProfileList from '@/components/Profiles/ProfileList'
import BankList from '@/components/Profiles/BankList'

export default {
  components: {
    ProfileList,
    BankList
  },
  data () {
    return {
      tabs: ['Profiles', 'Banks']
    }
  },
  computed: {
    ...mapState('setting', { settings: 'items' }),
    ...mapState('profile', { profiles: 'items' }),
    ...mapState('bank', { banks: 'items' })
  },
  watch: {
    'settings.nightMode': function (nightMode) {
      this.$vuetify.theme.dark = nightMode
    },
    profiles () {
      try {
        ipcRenderer.send('update-profiles', this.profiles)
      } catch (error) {
        //
      }
    },
    banks () {
      try {
        ipcRenderer.send('update-banks', this.banks)
      } catch (error) {
        //
      }
    }
  },
  created () {
    ipcRenderer.on('updateSettings', (event, arg) => {
      this.setSettings(arg)
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' })
  }
}
</script>
