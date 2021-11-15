import Config from '@/config/app'
import Discord from 'discord.js'
import store from '@/store/index'

const Core = store._modules.root._children.core.context

/**
 * ===============================================
 * Webhook service
 * ===============================================
 */
export default {
  /**
   * Send webhook
   *
   * @param {*} options
   */
  async sendWebhook (options) {
    const url = options.url.split('/')
    const webhookClient = new Discord.WebhookClient(url[5], url[6])

    const embed = new Discord.MessageEmbed()
      .setColor('#f7b586')
      .setTitle('Copped!')
      .addField(options.productName, options.productSku)
      .setThumbnail(options.productImage || 'https://i.imgur.com/eVt99L8.png')
      .setFooter(`${Core.state.about.productName} ${Core.state.about.version}`, Config.bot.avatar)
      .setTimestamp()

    if (options.orderNumber) embed.addField('Order Number', `||[${options.orderNumber}](${Config.services.titan22.track}?id=${options.orderNumber})||`, true)

    if (options.checkoutCookie) embed.addField('Cookie', `||${options.checkoutCookie}||`, true)

    if (options.checkoutLink) embed.addField('Checkout Link', `[PayMaya](${options.checkoutLink})`, true)

    if (options.profileName) embed.addField('Profile', `||${options.profileName}||`, true)

    if (options.proxyList) embed.addField('Proxy List', `||${options.proxyList}||`, true)

    if (options.mode) embed.addField('Mode', `${options.mode}`, true)

    if (options.checkoutMethod) embed.addField('Checkout Method', `${options.checkoutMethod}`, true)

    if (options.checkoutTime) embed.addField('Checkout Time', `${options.checkoutTime}s`, true)

    if (options.delay) embed.addField('Delay', `${options.delay}ms`, true)

    await webhookClient.send({
      username: Core.state.about.productName,
      avatarURL: Config.bot.avatar,
      embeds: [embed]
    })

    return true
  }
}
