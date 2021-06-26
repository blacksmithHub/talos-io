export default {
  /**
   * Services Configuration
   */
  services: {
    port: process.env.VUE_APP_PORT,
    redirect: process.env.VUE_APP_REDIRECT,

    /**
     * ===========================================
     * API Service Configuration
     * ===========================================
     *
     */
    auth: {
      domain: process.env.VUE_APP_API_AUTH_DOMAIN,
      url: process.env.VUE_APP_API_AUTH_URL
    },
    /**
     * ===========================================
     * Discord Service Configuration
     * ===========================================
     *
     */
    discord: {
      clientId: process.env.VUE_APP_DISCORD_CLIENT_ID
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
      checkout: process.env.VUE_APP_2C2P_URL,
      track: process.env.VUE_APP_TRACKING_URL
    },
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
