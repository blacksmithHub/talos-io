import MainWindow from '@/windows/Main'
import ProfileWindow from '@/windows/Profile'

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

    const url = arg.url
    const fingerprint = arg.fingerprint
    const settings = arg.settings
    const profile = ('profile' in arg) ? arg.profile : null

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=800,600'],
      defaultViewport: null,
      executablePath: settings.executablePath || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
    })

    const page = await browser.newPage()

    await page.setUserAgent(userAgent.toString())

    await page.goto(url)

    page.on('framenavigated', frame => {
      if (frame._url.includes('titan-bot-auth.herokuapp.com')) {
        const domain = 'https://titan-bot-auth.herokuapp.com/?'

        const queries = frame._url.slice(domain.length).split('&')

        const params = {}

        queries.forEach(element => {
          const query = element.split('=')

          params[query[0]] = query[1]
        })

        browser.close()

        if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('paypalParams', { params: params, fingerprint: fingerprint, profile: profile })

        if (ProfileWindow.getWindow()) ProfileWindow.getWindow().webContents.send('paypalParams', { params: params, fingerprint: fingerprint, profile: profile })
      }
    })
  }
}
