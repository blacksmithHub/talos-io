'use strict'

import { app, BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { autoUpdater } from 'electron-updater'

import home from './home'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Send a message to the rendering thread
function sendStatusToWindow (status, params) {
  win.webContents.send(status, params)
}

autoUpdater.on('update-available', (info) => {
  // version can be updated
  sendStatusToWindow('versionUpdate', 'preparing to download')
})
autoUpdater.on('update-not-available', (info) => {
  // no update available
  sendStatusToWindow('versionUpdate', 'up to date')

  setTimeout(() => {
    win.destroy()

    home.getWindow().show()

    if (isDevelopment) home.getWindow().openDevTools()
  }, 2000)
})
autoUpdater.on('error', () => {
  // Update Error
  sendStatusToWindow('versionUpdate', 'oops! something went wrong')
})
autoUpdater.on('download-progress', (progressObj) => {
  // download progress being downloaded
  sendStatusToWindow('versionUpdate', `downloading... ${progressObj.percent.toFixed()}%`)
})
autoUpdater.on('update-downloaded', (info) => {
  // Download completed
  sendStatusToWindow('versionUpdate', 're-launch the app')

  setTimeout(() => (app.exit()), 2000)
})

export default {
  getWindow () {
    return win
  },
  createWindow () {
    win = new BrowserWindow({
      width: 250,
      height: 250,
      minWidth: 250,
      minHeight: 250,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      fullscreenable: false,
      center: true,
      frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/update`)

      if (isDevelopment) {
        win.webContents.openDevTools()

        setTimeout(() => {
          win.destroy()

          home.getWindow().show()

          home.getWindow().openDevTools()
        }, 3000)
      }
    } else {
      createProtocol('app')

      win.loadURL('app://./index.html/#/update')

      setTimeout(() => (autoUpdater.checkForUpdatesAndNotify()), 1000)
    }

    win.once('ready-to-show', () => {
      win.show()
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
