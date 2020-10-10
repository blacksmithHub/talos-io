export default {
  data () {
    return {
      now: new Date(),
      timezone: this.$moment.tz.guess()
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
