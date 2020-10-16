import Config from '@/config/app'

export default {
  methods: {
    /**
     * Perform discord webhook.
     *
     * @param {*} url
     * @param {*} thumbnail
     * @param {*} product
     * @param {*} size
     * @param {*} profile
     * @param {*} secs
     */
    sendWebhook (url, thumbnail, product, size, profile, secs) {
      const webhook = require('webhook-discord')

      const Hook = new webhook.Webhook(url)

      const msg = new webhook.MessageBuilder()
        .setAvatar(Config.bot.avatar)
        .setFooter(Config.bot.name, Config.bot.avatar)
        .setTime()
        .setName(Config.bot.name)
        .setColor('#008000')
        .setTitle('Copped!')
        .setThumbnail(thumbnail)
        .addField('', product)
        .addField('**Size**', size)
        .addField('**Profile**', profile)
        .addField('**Checkout Time**', `${secs} secs`)

      Hook.send(msg)
    }
  }
}
