
import { BrowserWindow } from 'electron'

export default {
  /**
   * Initiate automation
   *
   * @param {*} arg
   */
  async automate (arg) {
    let jar = []

    await new Promise((resolve) => {
      (async () => {
        try {
          const win = new BrowserWindow({
            webPreferences: {
              nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
              enableRemoteModule: true
            }
          })

          await win.webContents.session.clearStorageData({
            storages: ['cookies']
          }, () => {})

          await win.loadURL('https://cf-js-challenge.sayem.eu.org')

          win.webContents.on('did-finish-load', async () => {
            win.webContents.session.cookies.get({})
              .then((cookies) => {
                if (cookies.find((el) => el.name === 'cf_clearance')) {
                  jar = cookies
                  win.close()
                }
              }).catch(() => {
                win.close()
              })
          })

          win.on('closed', () => {
            resolve()
          })
        } catch (error) {
          resolve()
        }
      })()
    })

    return jar
  }
}
