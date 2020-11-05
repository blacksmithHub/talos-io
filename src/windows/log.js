'use strict'

import { BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import home from './home'

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
      width: 500,
      height: 800,
      minHeight: 600,
      minWidth: 500,
      parent: home.getWindow(),
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/logs`)
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html/#/logs')
    }

    win.on('close', (e) => {
      e.preventDefault()
      win.hide()
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

ipcMain.on('toggle-logs', (event, arg) => {
  win.show()

  if (isDevelopment) win.openDevTools()
})
