'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let monitorWin
let profileWin
let settingsWin

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

/**
 *  Create main window
 */
function createWindow () {
  win = new BrowserWindow({
    width: 720,
    height: 900,
    minWidth: 500,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  createMonitorWindow()
  createProfileWindow()
  createSettingWindow()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)

    if (isDevelopment) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

/**
 * Create monitor window
 */
function createMonitorWindow () {
  monitorWin = new BrowserWindow({
    width: 1000,
    height: 900,
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

  monitorWin.on('close', (e) => {
    monitorWin.webContents.send('stop', true)
    e.preventDefault()
    monitorWin.hide()
  })
}

/**
 * Create monitor window
 */
function createProfileWindow () {
  profileWin = new BrowserWindow({
    width: 1000,
    height: 900,
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
}

/**
 * Create settings window
 */
function createSettingWindow () {
  settingsWin = new BrowserWindow({
    width: 500,
    height: 710,
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

  if (isDevelopment) monitorWin.openDevTools()
})

/**
 * Events
 */

ipcMain.on('update-settings', (event, arg) => {
  win.webContents.send('updateSettings', arg)
  monitorWin.webContents.send('updateSettings', arg)
})

ipcMain.on('update-tasks', (event, arg) => {
  settingsWin.webContents.send('updateTasks', arg)
})

ipcMain.on('clear-localStorage', (event, arg) => {
  win.reload()
  monitorWin.reload()
  settingsWin.reload()
})
