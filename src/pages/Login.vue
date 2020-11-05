<template>
  <div>
    {{ test }}
  </div>
</template>

<script>
import config from '@/config/app'

export default {
  data () {
    return {
      //
    }
  },
  computed: {
    test () {
      return config.services.api.url
    }
  }
}
</script>
