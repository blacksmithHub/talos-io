'use strict'

import { BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import home from './home'
import monitor from './monitor'
import profile from './profile'
import log from './log'
import setting from './setting'

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
      height: 700,
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
      win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/settings`)
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html/#/settings')
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

ipcMain.on('toggle-settings', (event, arg) => {
  win.show()

  if (isDevelopment) win.openDevTools()
})

ipcMain.on('update-settings', (event, arg) => {
  home.getWindow().webContents.send('updateSettings', arg)
  monitor.getWindow().webContents.send('updateSettings', arg)
  profile.getWindow().webContents.send('updateSettings', arg)
  log.getWindow().webContents.send('updateSettings', arg)
})

ipcMain.on('clear-localStorage', (event, arg) => {
  home.getWindow().reload()
  monitor.getWindow().reload()
  setting.getWindow().reload()
  profile.getWindow().reload()
})
