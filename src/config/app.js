export default {
  /**
  * Services Configuration
  */
  services: {
    /**
     * ===========================================
     * Auth Service Configuration
     * ===========================================
     *
     */
    auth: {
      url: process.env.VUE_APP_AUTH_URL
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
  }
}
