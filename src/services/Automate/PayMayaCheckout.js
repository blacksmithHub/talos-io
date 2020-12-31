import MainWindow from '@/windows/Main'

export default {
  /**
   * Initiate automation
   *
   * @param {*} arg
   */
  async automate (arg) {
    const puppeteer = require('puppeteer')

    const task = arg.task
    const settings = arg.settings

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=800,600'],
      defaultViewport: null,
      executablePath: settings.executablePath || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
    })

    const page = await browser.newPage()

    await page.goto(task.transactionData.request.uri.href)

    if (task.bank && Object.keys(task.bank).length && task.bank.bank.toLowerCase() === 'paymaya') {
      if (settings.autoPay) {
        await page.type('#cardNumber', task.bank.cardNumber)
        await page.type('#expiryDate', task.bank.expiryMonth)
        await page.type('#expiryDate', task.bank.expiryYear.substring(task.bank.expiryYear.length - 2))
        await page.type('#cvv', task.bank.cvv)
        await page.click('#pay')
      } else if (settings.autoFill) {
        await page.type('#cardNumber', task.bank.cardNumber)
        await page.type('#expiryDate', task.bank.expiryMonth)
        await page.type('#expiryDate', task.bank.expiryYear.substring(task.bank.expiryYear.length - 2))
        await page.type('#cvv', task.bank.cvv)
      }
    }

    page.on('close', () => {
      MainWindow.getWindow().webContents.send('updateTask', task)
    })
  }
}
