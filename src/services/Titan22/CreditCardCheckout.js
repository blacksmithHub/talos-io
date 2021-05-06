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
        args: ['--window-size=560,638'],
        defaultViewport: null,
        executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked')
      })

      const page = await browser.newPage()

      await page.setCookie({
        name: task.transactionData.cookie.name,
        value: task.transactionData.cookie.value,
        domain: task.transactionData.cookie.domain
      })

      await page.setUserAgent(userAgent.toString())

      await page.goto('https://t.2c2p.com/RedirectV3/Payment/Accept')

      const array = [
      `<p><strong>Account:</strong> ${task.account.name}</p>`,
      `<p><strong>Product name:</strong> ${task.transactionData.product.name}</p>`,
      `<p><strong>Product SKU:</strong> ${task.transactionData.product.sku}</p>`,
      `<p><strong>Price:</strong> ${task.transactionData.product.price.toLocaleString()}</p>`
      ]

      await page.waitForSelector('.navbar-inner')

      await page.evaluate((array) => {
        array.forEach(element => {
          var div = document.getElementsByClassName('navbar-inner')[0]
          div.insertAdjacentHTML('beforeend', element)
        })
      }, array)

      if (task.billing && task.billing.id) {
        switch (task.billing.bank.toLowerCase()) {
          case 'gcash':
          {
            try {
              if (task.autoFill || task.autoPay) {
                await page.waitForSelector('#btnGCashSubmit')
                await page.click('#btnGCashSubmit')

                await page.waitForNavigation()

                await page.waitForSelector('.layout-header')

                await page.evaluate((array) => {
                  array.forEach(element => {
                    var div = document.getElementsByClassName('layout-header')[0]
                    div.insertAdjacentHTML('beforebegin', element)
                  })
                }, array)

                await page.waitForSelector('input[type=number]')
                await page.type('input[type=number]', task.billing.cardNumber)
              }

              if (task.autoPay) await page.click('.ap-button')
            } catch (error) {
              console.log(error)
            }

            break
          }

          default:
          {
            try {
              if (task.autoFill || task.autoPay) {
                await page.waitForSelector('#credit_card_number')
                await page.type('#credit_card_number', task.billing.cardNumber)

                await page.waitForSelector('#credit_card_holder_name')
                await page.type('#credit_card_holder_name', task.billing.cardHolder)

                await page.waitForSelector('#credit_card_expiry_month')
                await page.type('#credit_card_expiry_month', task.billing.expiryMonth)

                await page.waitForSelector('#credit_card_expiry_year')
                await page.type('#credit_card_expiry_year', task.billing.expiryYear)

                await page.waitForSelector('#credit_card_cvv')
                await page.type('#credit_card_cvv', task.billing.cvv)

                await page.waitForSelector('#credit_card_issuing_bank_name')
                await page.type('#credit_card_issuing_bank_name', task.billing.bank)
              }

              if (task.autoPay) {
                await page.waitForSelector('#btnCCSubmit')
                await page.click('#btnCCSubmit')
              }
            } catch (error) {
              console.log(error)
            }

            break
          }
        }
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
