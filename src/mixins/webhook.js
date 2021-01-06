import { mapState } from 'vuex'
import Config from '@/config/app'
import webhook from 'webhook-discord'

export default {
  computed: {
    ...mapState('core', ['package'])
  },
  methods: {
    /**
     * Perform discord webhook.
     *
     * @param {*} url
     * @param {*} product
     * @param {*} size
     * @param {*} profile
     * @param {*} secs
     */
    sendWebhook (url, product, size, profile, secs, sku, cookie, method, img, proxy, checkoutLink, speed) {
      const Hook = new webhook.Webhook(url)

      const msg = new webhook.MessageBuilder()
        .setAvatar(Config.bot.avatar)
        .setFooter(`${this.package.productName} ${this.package.version}`, Config.bot.avatar)
        .setTime()
        .setName(this.package.productName)
        .setColor('#f7b586')
        .setTitle('Copped!')
        .addField(product, sku)
        .addField('**Size**', size)
        .setThumbnail(img || 'https://i.imgur.com/eVt99L8.png')

      if (cookie) msg.addField('**Cookie**', `||${cookie}||`)

      if (checkoutLink) msg.addField('**Checkout Link**', `[PayMaya](${checkoutLink})`)

      if (profile) msg.addField('**Profile**', `||${profile}||`)

      if (proxy && Object.keys(proxy).length) msg.addField('**Proxy**', `||${proxy.name}||`)

      if (secs) msg.addField('**Total Time**', `${secs}s`)

      if (speed) msg.addField('**Checkout Time**', `${speed}s`)

      if (method) msg.addField('**Checkout Method**', `${method}`)

      Hook.send(msg)
    }
  }
}
