export default {
  /**
   * Services Configuration
   */
  services: {
    local: process.env.VUE_APP_LOCAL,
    /**
     * ===========================================
     * API Service Configuration
     * ===========================================
     *
     */
    auth: {
      url: process.env.VUE_APP_API_AUTH_URL
    },
    /**
     * ===========================================
     * Discord Service Configuration
     * ===========================================
     *
     */
    discord: {
      auth: process.env.VUE_APP_DISCORD_AUTH,
      clientId: process.env.VUE_APP_DISCORD_CLIENT_ID,
      clientSecret: process.env.VUE_APP_DISCORD_CLIENT_SECRET
    },
    /**
     * ===========================================
     * Titan22 Service Configuration
     * ===========================================
     *
     */
    titan22: {
      url: process.env.VUE_APP_TITAN_URL,
      token: process.env.VUE_APP_TITAN_ADMIN_TOKEN,
      checkout: process.env.VUE_APP_2C2P_URL
    },
    /**
     * ===========================================
     * Port Configuration
     * ===========================================
     *
     */
    port: localStorage.getItem('core') ? JSON.parse(localStorage.getItem('core')).port : 5000,
    /**
     * ===========================================
     * Braintree Configuration
     * ===========================================
     *
     */
    braintree: {
      version: process.env.VUE_APP_BRAINTREE_VERSION,
      url: process.env.VUE_APP_BRAINTREE_URL
    }
  },

  /**
   * Bot Configuration
   */
  bot: {
    avatar: process.env.VUE_APP_BOT_AVATAR,
    webhook: process.env.VUE_APP_BOT_WEBHOOK
  }
}
