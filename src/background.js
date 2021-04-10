'use strict'
//
import { app, protocol, ipcMain, globalShortcut, BrowserWindow } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import LoginWindow from '@/windows/Login'
import MainWindow from '@/windows/Main'
import MonitorWindow from '@/windows/Monitor'
import ProfileWindow from '@/windows/Profile'
import ProxyWindow from '@/windows/Proxy'
import SettingWindow from '@/windows/Setting'

import PayMayaCheckout from '@/services/Titan22/PayMayaCheckout'
import CreditCardCheckout from '@/services/Titan22/CreditCardCheckout'
import PayPalAuthorization from '@/services/Titan22/PayPalAuthorization'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win

// Send a message to the rendering thread
function sendStatusToWindow (status, params) {
  win.webContents.send(status, params)
}

autoUpdater.on('update-available', () => {
  // version can be updated
  sendStatusToWindow('versionUpdate', 'preparing to download')
})

autoUpdater.on('update-not-available', () => {
  // no update available
  sendStatusToWindow('versionUpdate', 'up to date')

  if (!MainWindow.getWindow()) {
    MainWindow.createWindow()
    if (win) {
      win.destroy()
      win = null
    }
  }
})

autoUpdater.on('error', () => {
  // Update Error
  sendStatusToWindow('versionUpdate', 'oops! something went wrong')

  setTimeout(() => {
    if (LoginWindow.getWindow()) LoginWindow.getWindow().destroy()

    if (SettingWindow.getWindow()) SettingWindow.getWindow().destroy()

    if (ProxyWindow.getWindow()) ProxyWindow.getWindow().destroy()

    if (ProfileWindow.getWindow()) ProfileWindow.getWindow().destroy()

    if (MonitorWindow.getWindow()) MonitorWindow.getWindow().destroy()

    if (MainWindow.getWindow()) MainWindow.getWindow().destroy()

    LoginWindow.closeWindow()
    SettingWindow.closeWindow()
    ProxyWindow.closeWindow()
    ProfileWindow.closeWindow()
    MonitorWindow.closeWindow()
    MainWindow.closeWindow()

    if (win) win.destroy()

    win = null

    app.exit()
  }, 5000)
})

autoUpdater.on('download-progress', (progressObj) => {
  // download progress being downloaded
  sendStatusToWindow('versionUpdate', `downloading... ${progressObj.percent.toFixed()}%`)
})

autoUpdater.on('update-downloaded', () => {
  // Download completed
  sendStatusToWindow('versionUpdate', 're-launch the app')

  setTimeout(() => {
    if (LoginWindow.getWindow()) LoginWindow.getWindow().destroy()

    if (SettingWindow.getWindow()) SettingWindow.getWindow().destroy()

    if (ProxyWindow.getWindow()) ProxyWindow.getWindow().destroy()

    if (ProfileWindow.getWindow()) ProfileWindow.getWindow().destroy()

    if (MonitorWindow.getWindow()) MonitorWindow.getWindow().destroy()

    if (MainWindow.getWindow()) MainWindow.getWindow().destroy()

    LoginWindow.closeWindow()
    SettingWindow.closeWindow()
    ProxyWindow.closeWindow()
    ProfileWindow.closeWindow()
    MonitorWindow.closeWindow()
    MainWindow.closeWindow()

    if (win) win.destroy()

    win = null

    app.exit()
  }, 3000)
})

/**
 * Create main window
 */
function initializeWindows () {
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
    win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/check-update`)
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html/#/check-update')
  }

  win.once('ready-to-show', () => {
    win.show()

    setTimeout(() => {
      if (!isDevelopment) {
        autoUpdater.checkForUpdatesAndNotify()
      } else if (!MainWindow.getWindow()) {
        MainWindow.createWindow()
        if (win) {
          win.destroy()
          win = null
        }
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

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MainWindow.getWindow() === null) {
    initializeWindows()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  initializeWindows()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

/**
 * open monitor window
 */
ipcMain.on('launch-monitor', (event, arg) => {
  if (!MonitorWindow.getWindow()) MonitorWindow.createWindow()
})

/**
 * open profile window
 */
ipcMain.on('launch-profile', (event, arg) => {
  if (!ProfileWindow.getWindow()) ProfileWindow.createWindow()
})

/**
 * open proxy window
 */
ipcMain.on('launch-proxies', (event, arg) => {
  if (!ProxyWindow.getWindow()) ProxyWindow.createWindow()
})

/**
 * open settings window
 */
ipcMain.on('launch-setting', (event, arg) => {
  if (!SettingWindow.getWindow()) SettingWindow.createWindow()
})

/**
 * settings update event
 */
ipcMain.on('update-settings', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateSettings', arg)

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().webContents.send('updateSettings', arg)

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().webContents.send('updateSettings', arg)

  if (ProxyWindow.getWindow()) ProxyWindow.getWindow().webContents.send('updateSettings', arg)
})

/**
 * task list update event
 */
ipcMain.on('update-tasks', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateTasks', arg)
})

/**
 * profile list update event
 */
ipcMain.on('update-profiles', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateProfiles', arg)

  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateProfiles', arg)
})

/**
 * bank list update event
 */
ipcMain.on('update-banks', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateBanks', arg)

  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateBanks', arg)
})

/**
 * proxy pool update event
 */
ipcMain.on('update-proxies', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateProxies', arg)

  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateProxies', arg)
})

/**
 * clear all local storage
 */
ipcMain.on('clear-localStorage', (event, arg) => {
  if (MainWindow.getWindow()) {
    MainWindow.getWindow().webContents.session.clearCache()
    MainWindow.getWindow().webContents.session.clearStorageData()
    MainWindow.getWindow().reload()
  }

  if (MonitorWindow.getWindow()) {
    MonitorWindow.getWindow().webContents.session.clearCache()
    MonitorWindow.getWindow().webContents.session.clearStorageData()
    MonitorWindow.getWindow().reload()
  }

  if (SettingWindow.getWindow()) {
    SettingWindow.getWindow().webContents.session.clearCache()
    SettingWindow.getWindow().webContents.session.clearStorageData()
    SettingWindow.getWindow().reload()
  }

  if (ProfileWindow.getWindow()) {
    ProfileWindow.getWindow().webContents.session.clearCache()
    ProfileWindow.getWindow().webContents.session.clearStorageData()
    ProfileWindow.getWindow().reload()
  }

  if (ProxyWindow.getWindow()) {
    ProxyWindow.getWindow().webContents.session.clearCache()
    ProxyWindow.getWindow().webContents.session.clearStorageData()
    ProxyWindow.getWindow().reload()
  }
})

/**
 * Clear cache
 */
ipcMain.on('clear-cache', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.session.clearCache()

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().webContents.session.clearCache()

  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.session.clearCache()

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().webContents.session.clearCache()

  if (ProxyWindow.getWindow()) ProxyWindow.getWindow().webContents.session.clearCache()
})

/**
 * user authentication
 */
ipcMain.on('logout', async (event, arg) => {
  if (!LoginWindow.getWindow()) LoginWindow.createWindow()

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

  if (MainWindow.getWindow()) {
    MainWindow.getWindow().destroy()
    MainWindow.closeWindow()
  }

  if (win) win.destroy()
})

/**
 * key binding
 */
ipcMain.on('login', (event, arg) => {
  initializeWindows()

  if (LoginWindow.getWindow()) {
    LoginWindow.getWindow().destroy()
    LoginWindow.closeWindow()
  }
})

/**
 * PayPal authorization
 */
ipcMain.on('paypal-login', (event, arg) => {
  PayPalAuthorization.automate(JSON.parse(arg))
})

/**
 * PayMaya checkout method
 */
ipcMain.on('pay-with-paymaya', (event, arg) => {
  PayMayaCheckout.automate(JSON.parse(arg))
})

/**
 * 2c2p checkout method
 */
ipcMain.on('pay-with-2c2p', (event, arg) => {
  CreditCardCheckout.automate(JSON.parse(arg))
})
