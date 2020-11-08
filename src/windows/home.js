'use strict'

import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import profile from './profile'
import monitor from './monitor'
import setting from './setting'
import log from './log'

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
      width: 720,
      height: 870,
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
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html')
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

    monitor.createWindow()
    profile.createWindow()
    setting.createWindow()
    log.createWindow()
  }
}

ipcMain.on('update-tasks', (event, arg) => {
  setting.getWindow().webContents.send('updateTasks', arg)
  log.getWindow().webContents.send('updateTasks', arg)
})

ipcMain.on('hide-home', (event, arg) => {
  win.hide()
})

ipcMain.on('reload-home', (event, arg) => {
  win.reload()
})

ipcMain.on('toggle-home', (event, arg) => {
  win.show()

  if (isDevelopment) win.openDevTools()
})
