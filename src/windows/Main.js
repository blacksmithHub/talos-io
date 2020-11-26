'use strict'

import { BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { autoUpdater } from 'electron-updater'

import MonitorWindow from '@/windows/Monitor'
import ProfileWindow from '@/windows/Profile'
import SettingWindow from '@/windows/Setting'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Send a message to the rendering thread
function sendStatusToWindow (status, params) {
  if (win) win.webContents.send(status, params)

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().webContents.send(status, params)

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().webContents.send(status, params)

  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send(status, params)
}

let newVersion

autoUpdater.on('update-available', (info) => {
  // version can be updated
  newVersion = info.version
  sendStatusToWindow('versionUpdate', { msg: `v${newVersion} is now available! Preparing for download please wait...`, class: 'warning' })
})
autoUpdater.on('error', () => {
  // Update Error
  sendStatusToWindow('versionUpdate', { msg: 'Oops! something went wrong while downloading. Restart the application to retry.', class: 'error' })
})
autoUpdater.on('download-progress', (progressObj) => {
  // download progress being downloaded
  sendStatusToWindow('versionUpdate', { msg: `v${newVersion} is now downloading please wait... ${progressObj.percent.toFixed()}%`, class: 'warning' })
})
autoUpdater.on('update-downloaded', (info) => {
  // Download completed
  sendStatusToWindow('versionUpdate', { msg: `v${info.version} has been downloaded! Restart the application to install automatically`, class: 'success' })
})

export default {
  getWindow () {
    return win
  },
  createWindow () {
    win = new BrowserWindow({
      width: 720,
      height: 800,
      minWidth: 500,
      minHeight: 600,
      frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)

      if (isDevelopment) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html')

      setTimeout(() => {
        // detect whether there are updates
        autoUpdater.checkForUpdatesAndNotify()
      }, 3000)
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
