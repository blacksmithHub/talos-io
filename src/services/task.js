import moment from 'moment-timezone'
import fs from 'fs'
import base64 from 'base-64'
import utf8 from 'utf8'
import Constant from '@/config/constant'
import store from '@/store/index'

const Tasks = store._modules.root._children.task.context

/**
 * ===============================================
 * Task service
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

    return task && task.status.id === Constant.STATUS.RUNNING
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
    let data = await fs.readFileSync(`Task-${id}.json`, 'utf8')

    data = JSON.parse(base64.decode(data))

    let line = msg

    if (msg !== '====================') line = `[${moment().format('YYYY-MM-DD h:mm:ss a')}]: ${msg}`

    data.push(line)

    const text = JSON.stringify(data)
    const bytes = utf8.encode(text)
    const encoded = base64.encode(bytes)

    fs.writeFileSync(`Task-${id}.json`, encoded)
  }
}
