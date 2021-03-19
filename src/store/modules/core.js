/**
 * =====================================================
 * Core store
 * =====================================================
 *
 * Handles core states and behavior of the application.
 *
 * =====================================================
 */

export default {
  namespaced: true,
  state () {
    return {
      package: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D'))
    }
  }
}
