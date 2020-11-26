<template>
  <v-app>
    <v-main>
      <VersionUpdate
        v-if="alertMsg"
        :alert-msg="alertMsg"
        :alert-class="alertClass"
      />
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
            <ProfileList v-if="n === 1" />
            <BankList v-else />
          </v-tab-item>
        </v-tabs>
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

import ProfileList from '@/components/Profiles/ProfileList'
import BankList from '@/components/Profiles/BankList'
import Footer from '@/components/App/Footer'
import VersionUpdate from '@/components/App/VersionUpdate'

export default {
  components: {
    ProfileList,
    BankList,
    Footer,
    VersionUpdate
  },
  data () {
    return {
      tabs: ['Profiles', 'Banks'],
      alertMsg: '',
      alertClass: ''
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

    ipcRenderer.on('versionUpdate', (event, arg) => {
      this.alertMsg = arg.msg
      this.alertClass = arg.class
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' })
  }
}
</script>
