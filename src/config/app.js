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
    api: {
      url: process.env.VUE_APP_API_URL
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
    }
  },

  /**
   * Bot Configuration
   */
  bot: {
    avatar: process.env.VUE_APP_BOT_AVATAR,
    name: process.env.VUE_APP_BOT_NAME,
    version: process.env.VUE_APP_BOT_VERSION,
    footer: process.env.VUE_APP_BOT_FOOTER,
    webhook: process.env.VUE_APP_BOT_WEBHOOK
  }
}
