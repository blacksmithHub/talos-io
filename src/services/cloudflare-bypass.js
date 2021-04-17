import Store from '@/store/index'
import Constant from '@/config/constant'
import Task from '@/services/task'

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

      await page.goto(options.headers.referer)

      const content = await page.content()

      if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) {
        await browser.close()
        return []
      }

      if (content.includes('cf-browser-verification')) {
        cookies = await this.cfChallenge(page, id, service)
        await browser.close()
      } else if (content.includes('cf_captcha_kind')) {
        await browser.close()
        cookies = await this.cfHcaptcha(options, args, id, service)
      } else {
        await browser.close()
        return []
      }

      if (id && ((service === 'TASK' && !Task.isRunning(id)) || (!service && !this.isProxyRunning(id)))) return []

      return cookies
    } catch (error) {
      try {
        await browser.close()
      } catch (error) {
        //
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
      return []
    }
  },

  /**
   * Bypass cloudflare Hcaptcha
   */
  async cfHcaptcha (options, args, id = null, service) {
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

      await page.goto(options.headers.referer)

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
      try {
        await browser.close()
      } catch (error) {
        //
      }

      return []
    }
  }
}
