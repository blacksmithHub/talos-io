import Store from '@/store/index'
import Constant from '@/config/constant'
import Task from '@/services/task'
import Config from '@/config/app'

/**
 * ===============================================
 * Cloudflare Bypass service
 * ===============================================
 */
export default {
  /**
   * Identify if proxy is running
   */
  isProxyRunning (id) {
    const Proxies = Store._modules.root._children.proxy.context

    let proxy = Proxies.state.items

    proxy = proxy.find((el) => el.id === id)

    if (!proxy) return false

    return proxy.status === Constant.STATUS.RUNNING
  },
  /**
   * Initialize bypassing
   */
  async bypass (options, id = null, service = null) {
    // Start queue
    try {
      if (id && service && service === 'TASK') {
        let isPassed = false

        let cfStorage = Store._modules.root._children.cloudflare.context

        cfStorage.dispatch('addToQueue', {
          id: id,
          cookies: []
        })

        let interval = null
        await new Promise((resolve) => {
          interval = setInterval(() => {
            if (!Task.isRunning(id)) {
              clearInterval(interval)
              resolve()
            }

            cfStorage = Store._modules.root._children.cloudflare.context
            const item = cfStorage.state.items.queue.find((el) => el.id === id)

            if (item) {
              if (item.cookies.length) {
                isPassed = true
                clearInterval(interval)
                resolve()
              } else {
                for (let index = 0; index < cfStorage.state.items.doors.length; index++) {
                  if (cfStorage.state.items.queue.length && cfStorage.state.items.queue[0].id === id && cfStorage.state.items.doors[index]) {
                    cfStorage.dispatch('removeToQueue')

                    const doors = cfStorage.state.items.doors.slice()
                    doors[index] = false
                    cfStorage.dispatch('setDoors', doors)

                    clearInterval(interval)
                    resolve()
                  }
                }
              }
            } else {
              clearInterval(interval)
              resolve()
            }
          }, 500)
        })
        clearInterval(interval)

        if (isPassed) {
          cfStorage = Store._modules.root._children.cloudflare.context
          const index = cfStorage.state.items.queue.findIndex((el) => el.id === id)
          cfStorage.dispatch('removeToQueue', index)

          return []
        }
      }
    } catch (error) {
      console.log(error)
      return []
    }

    // Start bypassing

    if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) return []

    const vanillaPuppeteer = require('puppeteer')
    const { addExtra } = require('puppeteer-extra')
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    const ProxyChain = require('proxy-chain')

    const puppeteer = addExtra(vanillaPuppeteer)
    const stealth = StealthPlugin()
    puppeteer.use(stealth)

    const blockedResources = ['queue-it']

    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-agent=${options.headers['User-Agent']}`,
      '--window-size=560,638'
    ]

    let cookies = []

    if (options.proxy) {
      const oldProxyUrl = options.proxy
      const newProxyUrl = await ProxyChain.anonymizeProxy(oldProxyUrl)

      args.push(`--proxy-server=${newProxyUrl}`)
    }

    const browser = await puppeteer.launch({
      args,
      executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'),
      headless: false
    })

    try {
      if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) {
        await browser.close()
        return []
      }

      const page = await browser.newPage()

      await page.setRequestInterception(true)

      page.on('request', async (request) => {
        if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) {
          await browser.close()
          return []
        }

        if (request.url().endsWith('.png') || request.url().endsWith('.jpg')) {
        // BLOCK IMAGES
          request.abort()
        } else if (blockedResources.some(resource => request.url().indexOf(resource) !== -1)) {
        // BLOCK CERTAIN DOMAINS
          request.abort()
        } else {
        // ALLOW OTHER REQUESTS
          request.continue()
        }
      })

      await page.goto(`${Config.services.titan22.url}/brands/jordan.html/`)

      const content = await page.content()

      if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) {
        await browser.close()
        return []
      }

      if (content.includes('cf-browser-verification')) {
        if (id && service && service === 'TASK') {
          await Task.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Waiting for clearance' })
        }

        cookies = await this.cfChallenge(page, id, service)
        await browser.close()
      } else if (content.includes('cf_captcha_kind')) {
        if (id && service && service === 'TASK') {
          await Task.setCurrentTaskStatus(id, { status: Constant.STATUS.RUNNING, msg: 'Waiting to solve captcha' })
        }

        await browser.close()
        cookies = await this.cfHcaptcha(args, id, service)
      } else {
        await browser.close()
        return []
      }

      if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) return []

      try {
        if (id && service && service === 'TASK') {
          const cfStorage = Store._modules.root._children.cloudflare.context
          const taskStorage = Store._modules.root._children.task.context

          let ids = taskStorage.state.items.filter((el) => el.proxy.id === Task.getCurrentTask(id).proxy.id)
          ids = ids.filter((el) => el.proxy.configs.find((val) => val.proxy === options.proxy))
          ids = ids.map((el) => el.id)

          cfStorage.state.items.queue.filter((el) => ids.includes(el.id)).forEach((val) => {
            val.cookies = cookies
            cfStorage.dispatch('updateToQueue', val)
          })

          const doors = cfStorage.state.items.doors.slice()
          const key = doors.findIndex((el) => !el)
          doors[key] = true
          cfStorage.dispatch('setDoors', doors)
        }
      } catch (error) {
        console.log(error)
        return []
      }

      return cookies
    } catch (error) {
      console.log(error)

      try {
        await browser.close()
      } catch (error) {
        console.log(error)
      }

      return []
    }
  },

  /**
   * Bypass cloudflare challenge
   */
  async cfChallenge (page, id = null, service) {
    try {
      let response = []
      let content = await page.content()

      let counter = 0

      while (content.includes('cf-browser-verification')) {
        if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) break

        counter++

        if (counter > 3) break

        await page.waitForNavigation({
          timeout: 45000,
          waitUntil: 'domcontentloaded'
        })

        const cookies = await page.cookies()

        if (!cookies.find((el) => el.name === 'cf_clearance')) {
          content = await page.content()
          continue
        }

        response = cookies
        break
      }

      return response
    } catch (error) {
      console.log(error)
      return []
    }
  },

  /**
   * Bypass cloudflare Hcaptcha
   */
  async cfHcaptcha (args, id = null, service) {
    const vanillaPuppeteer = require('puppeteer')
    const { addExtra } = require('puppeteer-extra')
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')

    const puppeteer = addExtra(vanillaPuppeteer)
    const stealth = StealthPlugin()
    puppeteer.use(stealth)

    const blockedResources = ['queue-it']

    let response = []

    const browser = await puppeteer.launch({
      args,
      executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'),
      headless: false
    })

    try {
      if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) {
        await browser.close()
        return []
      }

      const page = await browser.newPage()

      await page.setRequestInterception(true)

      page.on('request', async (request) => {
        if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) await browser.close()

        if (request.url().endsWith('.png') || request.url().endsWith('.jpg')) {
          // BLOCK IMAGES
          request.abort()
        } else if (blockedResources.some(resource => request.url().indexOf(resource) !== -1)) {
          // BLOCK CERTAIN DOMAINS
          request.abort()
        } else {
          // ALLOW OTHER REQUESTS
          request.continue()
        }
      })

      await page.goto(`${Config.services.titan22.url}/brands/jordan.html/`)

      if (id) {
        const vm = this
        const loop = setInterval(async () => {
          if ((service === 'TASK' && !Task.isRunning(id)) || (!service && !vm.isProxyRunning(id))) {
            await browser.close()
            clearInterval(loop)
          }
        }, 1000)
      }

      let content = await page.content()

      while (content.includes('cf_captcha_kind')) {
        if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) break

        await page.waitForNavigation({
          timeout: 0,
          waitUntil: 'domcontentloaded'
        })

        if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) break

        const cookies = await page.cookies()

        if (!cookies.find((el) => el.name === 'cf_clearance')) {
          content = await page.content()
          continue
        }

        response = cookies
        break
      }

      await browser.close()

      return response
    } catch (error) {
      console.log(error)

      try {
        await browser.close()
      } catch (error) {
        console.log(error)
      }

      return []
    }
  }
}
