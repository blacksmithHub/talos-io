import MainWindow from '@/windows/Main'

export default {
  /**
   * Initiate automation
   *
   * @param {*} arg
   */
  async automate (arg) {
    const puppeteer = require('puppeteer')
    const proxyChain = require('proxy-chain')

    const task = arg.task
    const settings = arg.settings

    let proxy = {}

    if (task.proxy && Object.keys(task.proxy).length && task.proxy.proxies.length) proxy = task.proxy.proxies[Math.floor(Math.random() * task.proxy.proxies.length)]

    const args = ['--window-size=800,600']

    if (Object.keys(proxy).length) {
      const oldProxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
      const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl)
      args.push(`--proxy-server=${newProxyUrl}`)
    }

    const browser = await puppeteer.launch({
      headless: false,
      args: args,
      defaultViewport: null,
      executablePath: settings.executablePath || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
    })

    const page = await browser.newPage()

    await page.setCookie({
      name: task.transactionData.cookies.name,
      value: task.transactionData.cookies.value,
      domain: task.transactionData.cookies.domain
    })

    await page.goto('https://t.2c2p.com/RedirectV3/Payment/Accept')

    const array = [
      `<p><strong>Task:</strong> ${task.name}</p>`,
      `<p><strong>Profile:</strong> ${task.profile.name}</p>`,
      `<p><strong>Product name:</strong> ${task.transactionData.order.name}</p>`,
      `<p><strong>Product SKU:</strong> ${task.transactionData.order.sku}</p>`,
      `<p><strong>Size:</strong> ${task.transactionData.order.sizeLabel}</p>`,
      `<p><strong>Price:</strong> ${task.transactionData.order.price.toLocaleString()}</p>`
    ]

    await page.waitForSelector('.navbar-inner')

    await page.evaluate((array) => {
      array.forEach(element => {
        var div = document.getElementsByClassName('navbar-inner')[0]
        div.insertAdjacentHTML('beforeend', element)
      })
    }, array)

    if (task.bank && Object.keys(task.bank).length) {
      switch (task.bank.bank.toLowerCase()) {
        case 'gcash':
          if (settings.autoPay || settings.autoFill) {
            await page.click('#btnGCashSubmit')
            await page.waitForNavigation()
            await page.waitForSelector('.layout-header')

            await page.evaluate((array) => {
              array.forEach(element => {
                var div = document.getElementsByClassName('layout-header')[0]
                div.insertAdjacentHTML('beforebegin', element)
              })
            }, array)

            await page.type('input[type=number]', task.bank.cardNumber)
            await page.click('.ap-button')
          }
          break

        default:
          if (settings.autoPay) {
            await page.type('#credit_card_number', task.bank.cardNumber)
            await page.type('#credit_card_holder_name', task.bank.cardHolder)
            await page.type('#credit_card_expiry_month', task.bank.expiryMonth)
            await page.type('#credit_card_expiry_year', task.bank.expiryYear)
            await page.type('#credit_card_cvv', task.bank.cvv)
            await page.type('#credit_card_issuing_bank_name', task.bank.bank)
            await page.click('#btnCCSubmit')
          } else if (settings.autoFill) {
            await page.type('#credit_card_number', task.bank.cardNumber)
            await page.type('#credit_card_holder_name', task.bank.cardHolder)
            await page.type('#credit_card_expiry_month', task.bank.expiryMonth)
            await page.type('#credit_card_expiry_year', task.bank.expiryYear)
            await page.type('#credit_card_cvv', task.bank.cvv)
            await page.type('#credit_card_issuing_bank_name', task.bank.bank)
          }
          break
      }
    }

    page.on('close', () => {
      MainWindow.getWindow().webContents.send('updateTask', task)
    })
  }
}
