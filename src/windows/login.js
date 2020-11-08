'use strict'

import { BrowserWindow, globalShortcut, ipcMain } from 'electron'
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
      width: 450,
      height: 300,
      minWidth: 300,
      minHeight: 300,
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
      win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/login`)
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html/#/login')
    }

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

ipcMain.on('toggle-login', (event, arg) => {
  win.show()

  if (isDevelopment) win.openDevTools()
})

ipcMain.on('hide-login', (event, arg) => {
  win.hide()
})

ipcMain.on('set-auth', (event, arg) => {
  home.getWindow().webContents.send('setAuth', arg)
})
