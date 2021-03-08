import MainWindow from '@/windows/Main'

export default {
  /**
   * Initiate automation
   *
   * @param {*} arg
   */
  async automate (arg) {
    try {
      const puppeteer = require('puppeteer')
      const UserAgent = require('user-agents')
      const userAgent = new UserAgent({ deviceCategory: 'desktop' })

      const task = arg.task
      const settings = arg.settings

      const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=800,600'],
        defaultViewport: null
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

      page.on('close', () => { if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateTask', task) })
    } catch (error) {
      if (error.toString().includes('Could not find browser revision')) {
        if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('checkoutError', error)
      }
    }
  }
}
