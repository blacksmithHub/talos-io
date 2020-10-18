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
    sendWebhook (url, product, size, profile, secs) {
      const webhook = require('webhook-discord')

      const Hook = new webhook.Webhook(url)

      const msg = new webhook.MessageBuilder()
        .setAvatar('https://i.imgur.com/Pw2BaF4.png?2')
        .setFooter('Titan Destroyer IO', 'https://i.imgur.com/vbQJk8Q.png')
        .setTime()
        .setName('Titan Destroyer IO')
        .setColor('#f7b586')
        .setTitle('Copped!')
        .addField('', product)
        .addField('**Size**', size)
        .addField('**Profile**', `||${profile}||`)
        .addField('**Checkout Time**', `${secs} secs`)

      Hook.send(msg)
    }
  }
}
