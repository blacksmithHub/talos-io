'use strict'

import { app, protocol, ipcMain } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

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

/**
 *  Create main window
 */
function initializeWindows () {
  if (!MainWindow.getWindow()) MainWindow.createWindow()
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
