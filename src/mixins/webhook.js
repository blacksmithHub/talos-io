import { mapState } from 'vuex'
import Discord from 'discord.js'
import Config from '@/config/app'

export default {
  computed: {
    ...mapState('core', ['package'])
  },
  methods: {
    /**
     * Perform discord webhook.
     *
     * @param {*} config
     */
    sendWebhook (options) {
      const baseUrl = 'https://discordapp.com/api/webhooks/'
      const url = options.url.slice(baseUrl.length).split('/')

      const webhookClient = new Discord.WebhookClient(url[0], url[1])

      const embed = new Discord.MessageEmbed()
        .setColor('#f7b586')
        .setTitle('Copped!')
        .addField(options.productName, options.productSku)
        .setThumbnail(options.productImage || 'https://i.imgur.com/eVt99L8.png')
        .setFooter(`${this.package.productName} ${this.package.version}`, Config.bot.avatar)
        .setTimestamp()

      if (options.orderNumber) embed.addField('Order Number', `||${options.orderNumber}||`, true)

      if (options.checkoutCookie) embed.addField('Cookie', `||${options.checkoutCookie}||`, true)

      if (options.checkoutLink) embed.addField('Checkout Link', `[PayMaya](${options.checkoutLink})`, true)

      if (options.profileName) embed.addField('Profile', `||${options.profileName}||`, true)

      if (options.proxyList) embed.addField('Proxy List', `||${options.proxyList}||`, true)

      if (options.checkoutMethod) embed.addField('Checkout Method', `${options.checkoutMethod}`, true)

      if (options.checkoutTime) embed.addField('Checkout Time', `${options.checkoutTime}s`, true)

      if (options.delay) embed.addField('Delay', `${options.delay}ms`, true)

      webhookClient.send({
        username: this.package.productName,
        avatarURL: Config.bot.avatar,
        embeds: [embed]
      })
    }
  }
}
