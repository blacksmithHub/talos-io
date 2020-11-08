'use strict'

import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

export default {
  getWindow () {
    return win
  },
  createWindow () {
    win = new BrowserWindow({
      width: 450,
      height: 300,
      minWidth: 300,
      minHeight: 300,
      resizable: false,
      minimizable: false,
      maximizable: false,
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
      win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/login`)

      if (isDevelopment) win.openDevTools()
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html/#/login')
    }

    win.on('closed', () => {
      app.quit()
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

ipcMain.on('toggle-login', (event, arg) => {
  win.show()
})

ipcMain.on('hide-login', (event, arg) => {
  win.hide()
})
