'use strict'

import { app, protocol, ipcMain, globalShortcut, BrowserWindow } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import MainWindow from '@/windows/Main'
import MonitorWindow from '@/windows/Monitor'
import ProfileWindow from '@/windows/Profile'
import SettingWindow from '@/windows/Setting'

require('../server/index.js')

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

autoUpdater.on('update-available', (info) => {
  // version can be updated
  sendStatusToWindow('versionUpdate', 'preparing to download')
})
autoUpdater.on('update-not-available', (info) => {
  // no update available
  sendStatusToWindow('versionUpdate', 'up to date')

  if (!MainWindow.getWindow()) {
    MainWindow.createWindow()
    win.destroy()
  }
})
autoUpdater.on('error', () => {
  // Update Error
  sendStatusToWindow('versionUpdate', 'oops! something went wrong')

  setTimeout(() => (app.exit()), 5000)
})
autoUpdater.on('download-progress', (progressObj) => {
  // download progress being downloaded
  sendStatusToWindow('versionUpdate', `downloading... ${progressObj.percent.toFixed()}%`)
})
autoUpdater.on('update-downloaded', (info) => {
  // Download completed
  sendStatusToWindow('versionUpdate', 're-launch the app')

  setTimeout(() => (app.exit()), 3000)
})

/**
 *  Create main window
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

    if (isDevelopment) win.webContents.openDevTools()

    if (!MainWindow.getWindow()) {
      MainWindow.createWindow()
      win.destroy()
    }
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html/#/check-update')

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

ipcMain.on('launch-monitor', (event, arg) => {
  if (!MonitorWindow.getWindow()) MonitorWindow.createWindow()
})

ipcMain.on('launch-profile', (event, arg) => {
  if (!ProfileWindow.getWindow()) ProfileWindow.createWindow()
})

ipcMain.on('launch-setting', (event, arg) => {
  if (!SettingWindow.getWindow()) SettingWindow.createWindow()
})

ipcMain.on('update-settings', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateSettings', arg)

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().webContents.send('updateSettings', arg)

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().webContents.send('updateSettings', arg)
})

ipcMain.on('update-tasks', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateTasks', arg)
})

ipcMain.on('update-profiles', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateProfiles', arg)

  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateProfiles', arg)
})

ipcMain.on('update-banks', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateBanks', arg)

  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateBanks', arg)
})

ipcMain.on('clear-localStorage', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().reload()

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().reload()

  if (SettingWindow.getWindow()) SettingWindow.getWindow().reload()

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().reload()
})
