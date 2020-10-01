export default {
  data () {
    return {
      now: new Date(),
      timezone: this.$moment.tz.guess()
    }
  },
  methods: {
    /**
     * Convert Local to JST Date time string
     *
     * @param string date
     * @return string
     */
    localToJstDateTimeString (date) {
      const localTime = this.$moment.tz(date, this.timezone)
      const jst = this.$moment(localTime).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')

      return jst
    },
    /**
     * Convert Local to JST Date string
     *
     * @param string date
     * @return string
     */
    localToJSTDateString (date) {
      const localTime = this.$moment.tz(date, this.timezone)
      const jst = this.$moment(localTime).tz('Asia/Tokyo').format('YYYY-MM-DD')

      return jst
    },

    /**
     * Convert JST to Local Date time string
     *
     * @param string date
     * @return string
     */
    jstToLocalDateTimeString (date) {
      const local = this.jstToLocalDatetime(date).format('YYYY-MM-DD HH:mm:ss')

      return local
    },

    /**
     * Convert JST to Local Date string
     *
     * @param string date
     * @return string
     */
    jstToLocalDateString (date) {
      const local = this.jstToLocalDatetime(date).format('YYYY-MM-DD')

      return local
    },

    /**
     * Convert JST to Local Datetime
     *
     * @param string date
     * @return string
     */
    jstToLocalDatetime (date) {
      const jst = this.$moment.tz(date, 'Asia/Tokyo')
      const local = this.$moment(jst).tz(this.timezone)

      return local
    },

    /**
     * Convert UTC date to Asia/Tokyo
     *
     * @param {*} date
     */
    utcToAsiaTokyo (date) {
      return this.$moment.utc(date).tz('Asia/Tokyo')
    }
  }
}
