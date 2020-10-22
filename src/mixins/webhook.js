import Config from '@/config/app'

export default {
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
    sendWebhook (url, product, size, profile, secs, sku) {
      const webhook = require('webhook-discord')

      const Hook = new webhook.Webhook(url)

      const msg = new webhook.MessageBuilder()
        .setAvatar(Config.bot.avatar)
        .setFooter(`${Config.bot.name} ${Config.bot.version}`, Config.bot.footer)
        .setTime()
        .setName(Config.bot.name)
        .setColor('#f7b586')
        .setTitle('Copped!')
        .addField(product, sku)
        .addField('**Size**', size)
        .addField('**Profile**', `||${profile}||`)
        .addField('**Checkout Time**', `${secs}s`)

      Hook.send(msg)
    }
  }
}
