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
import axios from 'axios'

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

    ipcRenderer.on('paypalParams', async (event, arg) => {
      if (arg.profile) {
        const params = {
          paypalAccount: {
            correlationId: arg.params.token,
            paymentToken: arg.params.paymentId,
            payerId: arg.params.PayerID,
            unilateral: true,
            intent: 'authorize'
          },
          braintreeLibraryVersion: 'braintree/web/3.48.0',
          authorizationFingerprint: arg.fingerprint
        }

        const response = await axios.post('https://api.braintreegateway.com/merchants/nw7drdhqdjqh5x6n/client_api/v1/payment_methods/paypal_accounts', params)

        const data = response.data

        this.updateProfile({
          ...arg.profile,
          paypal: data
        })
      }
    })
  },
  methods: {
    ...mapActions('setting', { setSettings: 'setItems' }),
    ...mapActions('profile', { updateProfile: 'updateItem' })
  }
}
</script>
