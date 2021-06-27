import DA from 'distribute-array'

export default {
  data () {
    return {
      now: new Date()
    }
  },
  methods: {
    /**
     * Distribute proxies
     */
    setProxyConfigs (tasks, item, localhost) {
      try {
        const proxyTasks = tasks.filter((val) => val.proxy.id === item.proxy.id)

        if (item.proxy.distribute) {
          const distributedProxy = DA(item.proxy.proxies, proxyTasks.length)
          const distributedConfigs = DA(item.proxy.configs, proxyTasks.length)

          for (let index = 0; index < distributedProxy.length; index++) {
            const task = { ...proxyTasks[index] }

            if (distributedProxy[index].length && distributedConfigs[index].length) {
              task.proxy = {
                ...item.proxy,
                proxies: distributedProxy[index],
                configs: distributedConfigs[index]
              }
            } else {
              task.proxy = localhost
            }

            task.proxy.configs = task.proxy.configs.map((val) => {
              const proxyTask = proxyTasks.find((el) => el.proxy.configs.find((d) => d.proxy === val.proxy))

              if (proxyTask) {
                val = proxyTask.proxy.configs.find((d) => d.proxy === val.proxy)
              } else {
                const opt = { deviceCategory: 'desktop' }

                if (task.mode.id !== 1) opt.deviceCategory = 'mobile'

                const UserAgent = require('user-agents')
                let userAgent = new UserAgent(opt)
                userAgent = userAgent.toString()

                val.userAgent = userAgent
                val.retry = 1
              }

              return val
            })

            tasks = tasks.map((val) => {
              if (val.id === task.id) val = task

              return val
            })
          }
        } else {
          const opt = { deviceCategory: 'desktop' }

          if (item.mode.id !== 1) opt.deviceCategory = 'mobile'

          const UserAgent = require('user-agents')
          let userAgent = new UserAgent(opt)
          userAgent = userAgent.toString()

          item.proxy.configs = item.proxy.configs.map(el => {
            return {
              ...el,
              userAgent: userAgent,
              retry: 1
            }
          })

          tasks = tasks.map((val) => {
            if (val.id === item.id) val = item

            return val
          })
        }

        return tasks
      } catch (error) {
        console.log(error)

        return tasks
      }
    },
    /**
     * Reset proxy count
     */
    setOldProxyConfigs (tasks, oldProxyTasks, proxy, localhost) {
      try {
        const distributedProxy = DA(proxy.proxies, oldProxyTasks.length)
        const distributedConfigs = DA(proxy.configs, oldProxyTasks.length)

        for (let index = 0; index < distributedProxy.length; index++) {
          const task = { ...oldProxyTasks[index] }

          if (distributedProxy[index].length && distributedConfigs[index].length) {
            task.proxy = {
              ...proxy,
              proxies: distributedProxy[index],
              configs: distributedConfigs[index]
            }
          } else {
            task.proxy = localhost
          }

          task.proxy.configs = task.proxy.configs.map((val) => {
            const proxyTask = oldProxyTasks.find((el) => el.proxy.configs.find((d) => d.proxy === val.proxy))

            if (proxyTask) {
              val = proxyTask.proxy.configs.find((d) => d.proxy === val.proxy)
            } else {
              const opt = { deviceCategory: 'desktop' }

              if (task.mode.id !== 1) opt.deviceCategory = 'mobile'

              const UserAgent = require('user-agents')
              let userAgent = new UserAgent(opt)
              userAgent = userAgent.toString()

              val.userAgent = userAgent
              val.retry = 1
            }

            return val
          })

          tasks = tasks.map((val) => {
            if (val.id === task.id) val = task

            return val
          })
        }

        return tasks
      } catch (error) {
        console.log(error)

        return tasks
      }
    }
  }
}
