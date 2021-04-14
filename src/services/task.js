import Constant from '@/config/constant'
import moment from 'moment-timezone'
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
  }
}
