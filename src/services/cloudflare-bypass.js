import Store from '@/store/index'
import Constant from '@/config/constant'

const Proxies = Store._modules.root._children.proxy.context

const vanillaPuppeteer = require('puppeteer')
const { addExtra } = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const ProxyChain = require('proxy-chain')

const puppeteer = addExtra(vanillaPuppeteer)
const stealth = StealthPlugin()
puppeteer.use(stealth)

const blockedResources = ['queue-it']

/**
 * ===============================================
 * Cloudflare Bypass service
 * ===============================================
 */
export default {
  /**
   *
   */
  isProxyRunning (id) {
    let proxy = Proxies.state.items

    proxy = proxy.find((el) => el.id === id)

    if (!proxy) return false

    return proxy.status === Constant.STATUS.RUNNING
  },
  /**
   * Initialize bypassing
   */
  async bypass (options, id) {
    try {
      const args = ['--no-sandbox', '--disable-setuid-sandbox', `--user-agent=${options.headers['User-Agent']}`, '--window-size=500,300']
      let cookies = []

      if (options.proxy) {
        const oldProxyUrl = options.proxy
        const newProxyUrl = await ProxyChain.anonymizeProxy(oldProxyUrl)

        args.push(`--proxy-server=${newProxyUrl}`)
      }

      const browser = await puppeteer.launch({ args, executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'), headless: false })

      if (!this.isProxyRunning(id)) {
        await browser.close()
        return []
      }

      const page = await browser.newPage()

      await page.setRequestInterception(true)

      page.on('request', async (request) => {
        if (!this.isProxyRunning(id)) {
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

      await page.goto(options.url)

      const content = await page.content()

      if (!this.isProxyRunning(id)) {
        await browser.close()
        return []
      }

      if (content.includes('cf-browser-verification')) {
        cookies = await this.cfChallenge(page, id)
        await browser.close()
      } else if (content.includes('cf_captcha_kind')) {
        await browser.close()
        cookies = await this.cfHcaptcha(options, args, id)
      } else {
        await browser.close()
        return []
      }

      if (!this.isProxyRunning(id)) return []

      return cookies
    } catch (error) {
      return []
    }
  },

  /**
   * Bypass cloudflare challenge
   */
  async cfChallenge (page, id) {
    try {
      let response = []
      let content = await page.content()

      let counter = 0

      while (content.includes('cf-browser-verification') && this.isProxyRunning(id)) {
        counter++

        if (counter >= 3) break

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
  async cfHcaptcha (options, args, id) {
    let response = []

    const browser = await puppeteer.launch({ args, executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'), headless: false })

    if (!this.isProxyRunning(id)) {
      await browser.close()
      return []
    }

    const page = await browser.newPage()

    await page.setRequestInterception(true)

    page.on('request', async (request) => {
      if (!this.isProxyRunning(id)) await browser.close()

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

    await page.goto(options.url)

    const vm = this
    setInterval(async () => {
      if (!vm.isProxyRunning(id)) await browser.close()
    }, 1000)

    let content = await page.content()

    while (content.includes('cf_captcha_kind') && this.isProxyRunning(id)) {
      await page.waitForNavigation({
        timeout: 0,
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
  }
}
