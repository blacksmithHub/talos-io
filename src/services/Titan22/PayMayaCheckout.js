import MainWindow from '@/windows/Main'
// import store from '@/store/index'

export default {
  /**
   * Initiate automation
   *
   * @param {*} arg
   */
  async automate (arg) {
    const puppeteer = require('puppeteer')
    const UserAgent = require('user-agents')
    const userAgent = new UserAgent({ deviceCategory: 'desktop' })

    const task = arg.task
    const settings = arg.settings

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=800,600'],
      defaultViewport: null,
      executablePath: settings.executablePath || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
    })

    const page = await browser.newPage()

    await page.setUserAgent(userAgent.toString())

    await page.goto(task.transactionData.checkoutLink)

    try {
      if (task.bank && Object.keys(task.bank).length && task.bank.bank.toLowerCase() === 'paymaya') {
        if (settings.autoFill || settings.autoPay) {
          await page.waitForSelector('#cardNumber')
          await page.type('#cardNumber', task.bank.cardNumber)

          await page.waitForSelector('#expiryDate')
          await page.type('#expiryDate', task.bank.expiryMonth)
          await page.type('#expiryDate', task.bank.expiryYear.substring(task.bank.expiryYear.length - 2))

          await page.waitForSelector('#cvv')
          await page.type('#cvv', task.bank.cvv)
        }

        if (settings.autoPay) {
          await page.waitForSelector('#pay')
          await page.click('#pay')
        }
      }
    } catch (error) {
      //
    }

    page.on('close', () => {
      MainWindow.getWindow().webContents.send('updateTask', task)
    })
  }
}
