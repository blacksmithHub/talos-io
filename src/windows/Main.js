'use strict'

import { BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import LoginWindow from '@/windows/Login'
import MonitorWindow from '@/windows/Monitor'
import ProfileWindow from '@/windows/Profile'
import ProxyWindow from '@/windows/Proxy'
import SettingWindow from '@/windows/Setting'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

export default {
  getWindow () {
    return win
  },
  closeWindow () {
    win = null
  },
  createWindow () {
    win = new BrowserWindow({
      width: 1100,
      height: 900,
      minWidth: 1100,
      minHeight: 900,
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
    }

    win.once('ready-to-show', () => {
      win.show()
    })

    win.on('closed', () => {
      if (LoginWindow.getWindow()) {
        LoginWindow.getWindow().destroy()
        LoginWindow.closeWindow()
      }

      if (MonitorWindow.getWindow()) {
        MonitorWindow.getWindow().destroy()
        MonitorWindow.closeWindow()
      }

      if (ProfileWindow.getWindow()) {
        ProfileWindow.getWindow().destroy()
        ProfileWindow.closeWindow()
      }

      if (ProxyWindow.getWindow()) {
        ProfileWindow.getWindow().destroy()
        ProxyWindow.closeWindow()
      }

      if (SettingWindow.getWindow()) {
        SettingWindow.getWindow().destroy()
        SettingWindow.closeWindow()
      }

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
