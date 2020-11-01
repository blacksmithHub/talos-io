'use strict'

import { app, protocol, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let monitorWin
let profileWin
let settingsWin
let logWin

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// Send a message to the rendering thread
function sendStatusToWindow (status, params) {
  win.webContents.send(status, params)
}

autoUpdater.autoDownload = false // Turn off Automatic Updates
autoUpdater.autoInstallOnAppQuit = true // APP quit when the automatic installation

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('autoupdate', 'Checking for update...')
})
autoUpdater.on('update-available', (info) => {
  // version can be updated
  // sendStatusToWindow('autoUpdater-canUpdate', info)
  sendStatusToWindow('autoupdate', info)
})
autoUpdater.on('error', (err) => {
  // Update Error
  // sendStatusToWindow('autoUpdater-error', err)
  sendStatusToWindow('autoupdate', err)
})
autoUpdater.on('download-progress', (progressObj) => {
  // download progress being downloaded
  // sendStatusToWindow('autoUpdater-progress', progressObj)
  sendStatusToWindow('autoupdate', progressObj)
})
autoUpdater.on('update-downloaded', (info) => {
  // Download completed
  // sendStatusToWindow('autoUpdater-downloaded')
  sendStatusToWindow('autoupdate', info)
})

/**
 *  Create main window
 */
function createWindow () {
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

  createMonitorWindow()
  createProfileWindow()
  createSettingWindow()
  createLogWindow()

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
    win = null
  })

  win.on('focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {})
  })

  win.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+R')
  })

  setTimeout(() => {
    // detect whether there are updates
    autoUpdater.checkForUpdates()
  }, 3000)
}

/**
 * Create monitor window
 */
function createMonitorWindow () {
  monitorWin = new BrowserWindow({
    width: 955,
    height: 800,
    minHeight: 600,
    minWidth: 500,
    parent: win,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    monitorWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/monitor`)

    if (isDevelopment) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    monitorWin.loadURL('app://./index.html/#/monitor')
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  monitorWin.on('close', (e) => {
    monitorWin.webContents.send('stop', true)
    e.preventDefault()
    monitorWin.hide()
  })

  monitorWin.on('focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {})
  })

  monitorWin.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+R')
  })
}

/**
 * Create monitor window
 */
function createProfileWindow () {
  profileWin = new BrowserWindow({
    width: 500,
    height: 800,
    minHeight: 600,
    minWidth: 500,
    parent: win,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    profileWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/profiles`)

    if (isDevelopment) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    profileWin.loadURL('app://./index.html/#/profiles')
  }

  profileWin.on('close', (e) => {
    e.preventDefault()
    profileWin.hide()
  })

  profileWin.on('focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {})
  })

  profileWin.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+R')
  })
}

/**
 * Create settings window
 */
function createSettingWindow () {
  settingsWin = new BrowserWindow({
    width: 500,
    height: 700,
    minHeight: 600,
    minWidth: 500,
    parent: win,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    settingsWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/settings`)
  } else {
    createProtocol('app')
    settingsWin.loadURL('app://./index.html/#/settings')
  }

  settingsWin.on('close', (e) => {
    e.preventDefault()
    settingsWin.hide()
  })

  settingsWin.on('focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {})
  })

  settingsWin.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+R')
  })
}

/**
 * Create log window
 */
function createLogWindow () {
  logWin = new BrowserWindow({
    width: 500,
    height: 800,
    minHeight: 600,
    minWidth: 500,
    parent: win,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    logWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/logs`)
  } else {
    createProtocol('app')
    logWin.loadURL('app://./index.html/#/logs')
  }

  logWin.on('close', (e) => {
    e.preventDefault()
    logWin.hide()
  })

  logWin.on('focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {})
  })

  logWin.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+R')
  })
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
  if (win === null) {
    createWindow()
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

  createWindow()
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
 * Navigation
 */

ipcMain.on('toggle-monitor', (event, arg) => {
  monitorWin.show()

  if (isDevelopment) monitorWin.openDevTools()

  monitorWin.webContents.send('init', arg)
})

ipcMain.on('toggle-profiles', (event, arg) => {
  profileWin.show()

  if (isDevelopment) profileWin.openDevTools()
})

ipcMain.on('toggle-settings', (event, arg) => {
  settingsWin.show()

  if (isDevelopment) settingsWin.openDevTools()
})

ipcMain.on('toggle-logs', (event, arg) => {
  logWin.show()

  if (isDevelopment) logWin.openDevTools()
})

/**
 * Events
 */

ipcMain.on('update-settings', (event, arg) => {
  win.webContents.send('updateSettings', arg)
  monitorWin.webContents.send('updateSettings', arg)
  profileWin.webContents.send('updateSettings', arg)
  logWin.webContents.send('updateSettings', arg)
})

ipcMain.on('update-tasks', (event, arg) => {
  settingsWin.webContents.send('updateTasks', arg)
  logWin.webContents.send('updateTasks', arg)
})

ipcMain.on('update-profiles', (event, arg) => {
  settingsWin.webContents.send('updateProfiles', arg)
  win.webContents.send('updateProfiles', arg)
})

ipcMain.on('update-banks', (event, arg) => {
  settingsWin.webContents.send('updateBanks', arg)
  win.webContents.send('updateBanks', arg)
})

ipcMain.on('clear-localStorage', (event, arg) => {
  win.reload()
  monitorWin.reload()
  settingsWin.reload()
  profileWin.reload()
})
