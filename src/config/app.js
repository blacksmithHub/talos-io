export default {
  /**
   * Services Configuration
   */
  services: {
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
    port: JSON.parse(localStorage.getItem('core')).port
  },

  /**
   * Bot Configuration
   */
  bot: {
    avatar: process.env.VUE_APP_BOT_AVATAR,
    webhook: process.env.VUE_APP_BOT_WEBHOOK
  }
}
