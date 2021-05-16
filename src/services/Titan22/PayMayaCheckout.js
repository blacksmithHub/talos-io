import { ipcRenderer } from 'electron'
import store from '@/store/index'

const Tasks = store._modules.root._children.task.context

export default {
  /**
   * Initiate automation
   *
   * @param {*} id
   */
  async automate (id) {
    const task = Tasks.state.items.find((data) => data.id === id)

    try {
      const puppeteer = require('puppeteer')
      const UserAgent = require('user-agents')
      const userAgent = new UserAgent({ deviceCategory: 'desktop' })

      const browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--window-size=560,638'
        ],
        defaultViewport: null,
        executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked')
      })

      const page = await browser.newPage()

      await page.setUserAgent(userAgent.toString())

      await page.goto(task.transactionData.checkoutLink)

      try {
        if (task.billing && task.billing.id && task.billing.bank.toLowerCase() === 'paymaya') {
          if (task.autoFill || task.autoPay) {
            await page.waitForSelector('#cardNumber')
            await page.type('#cardNumber', task.billing.cardNumber)

            await page.waitForSelector('#expiryDate')
            await page.type('#expiryDate', task.billing.expiryMonth)
            await page.type('#expiryDate', task.billing.expiryYear.substring(task.billing.expiryYear.length - 2))

            await page.waitForSelector('#cvv')
            await page.type('#cvv', task.billing.cvv)
          }

          if (task.autoPay) {
            await page.waitForSelector('#pay')
            await page.click('#pay')
          }
        }
      } catch (error) {
        console.log(error)
      }

      page.on('close', () => {
        ipcRenderer.send('update-task', id)
      })
    } catch (error) {
      console.log(error)
      ipcRenderer.send('update-task', id)
    }
  }
}
