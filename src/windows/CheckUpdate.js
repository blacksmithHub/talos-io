'use strict'

import { BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { autoUpdater } from 'electron-updater'

import MainWindow from '@/windows/Main'

const isDevelopment = process.env.NODE_ENV !== 'production'

let win

export default {
  sendStatusToWindow (status, params) {
    win.webContents.send(status, params)
  },
  getWindow () {
    return win
  },
  async createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
      width: 250,
      height: 250,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      closable: false,
      center: true,
      show: false,
      frame: false,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/check-update`)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html/#/check-update')
    }

    win.once('ready-to-show', () => {
      win.show()

      setTimeout(() => {
        if (!isDevelopment) {
          autoUpdater.checkForUpdatesAndNotify()
        } else {
          MainWindow.createWindow()
          if (win) win.destroy()
        }
      }, 5000)
    })

    win.on('closed', () => {
      win = null
    })

    if (!isDevelopment) {
      win.on('focus', () => {
        globalShortcut.register('CommandOrControl+R', () => {})
      })

      win.on('blur', () => {
        globalShortcut.unregister('CommandOrControl+R')
      })
    }
  }
}
