export default {
  data () {
    return {
      now: new Date()
    }
  },
  methods: {
    /**
     * Format date.
     *
     * @param {*} date
     */
    formatDate (date) {
      return this.$moment(date).format('MMM. D, YYYY - h:mm a')
    }
  }
}
