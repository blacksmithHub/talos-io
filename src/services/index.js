import Constant from '@/config/constant'
import Config from '@/config/app'

import Discord from 'discord.js'
import moment from 'moment-timezone'

import store from '@/store/index'

const Tasks = store._modules.root._children.task.context
const Core = store._modules.root._children.core.context

/**
 * ===============================================
 * Bot service
 * ===============================================
 */
export default {
  /**
   * Identify task status
   *
   * @param {*} id
   * @return {*} bool
   */
  isRunning (id) {
    const task = this.getCurrentTask(id)

    return task && task.status.id === Constant.TASK.STATUS.RUNNING
  },

  /**
   * Return current task
   *
   * @param {*} id
   * @return {*} task
   */
  getCurrentTask (id) {
    const tasks = Tasks.state.items
    let task = null

    if (tasks.length) {
      task = tasks.find((data) => data.id === id)
    }

    return task
  },

  /**
   * Set status of current task
   *
   * @param {*} id
   * @param {*} conf
   */
  async setCurrentTaskStatus (id, conf) {
    const task = await this.getCurrentTask(id)

    if (task) {
      task.status = {
        id: conf.status,
        msg: conf.msg,
        class: conf.attr || 'orange'
      }

      Tasks.dispatch('updateItem', task)
    }
  },

  /**
   * Update logs of current task
   *
   * @param {*} id
   * @param {*} msg
   */
  async updateCurrentTaskLog (id, msg) {
    const task = await this.getCurrentTask(id)

    if (task) {
      task.logs = `${task.logs || ''};[${moment().format('YYYY-MM-DD h:mm:ss a')}]: ${msg}`

      Tasks.dispatch('updateItem', task)
    }
  },

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
      .setFooter(`${Core.state.package.productName} ${Core.state.package.version}`, Config.bot.avatar)
      .setTimestamp()

    if (options.orderNumber) embed.addField('Order Number', `||${options.orderNumber}||`, true)

    if (options.checkoutCookie) embed.addField('Cookie', `||${options.checkoutCookie}||`, true)

    if (options.checkoutLink) embed.addField('Checkout Link', `[PayMaya](${options.checkoutLink})`, true)

    if (options.profileName) embed.addField('Profile', `||${options.profileName}||`, true)

    if (options.proxyList) embed.addField('Proxy List', `||${options.proxyList}||`, true)

    if (options.mode) embed.addField('Mode', `${options.mode}`, true)

    if (options.checkoutMethod) embed.addField('Checkout Method', `${options.checkoutMethod}`, true)

    if (options.checkoutTime) embed.addField('Checkout Time', `${options.checkoutTime}s`, true)

    if (options.delay) embed.addField('Delay', `${options.delay}ms`, true)

    await webhookClient.send({
      username: Core.state.package.productName,
      avatarURL: Config.bot.avatar,
      embeds: [embed]
    })
  }
}
