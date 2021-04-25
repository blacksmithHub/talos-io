'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

import MainWindow from '@/windows/Main'
import MonitorWindow from '@/windows/Monitor'
import LoginWindow from '@/windows/Login'
import CheckUpdateWindow from '@/windows/CheckUpdate'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function initializeWindows () {
  CheckUpdateWindow.createWindow()
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
  if (BrowserWindow.getAllWindows().length === 0) initializeWindows()
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
 * --------------------------------------------------------
 * Auto Updater Events
 * --------------------------------------------------------
 */

autoUpdater.on('update-available', () => {
  // version can be updated
  if (CheckUpdateWindow.getWindow()) {
    CheckUpdateWindow.sendStatusToWindow('versionUpdate', 'preparing to download')
  } else if (MainWindow.getWindow()) {
    MainWindow.getWindow().webContents.send('newUpdate')
  }
})

autoUpdater.on('update-not-available', () => {
  // no update available
  if (CheckUpdateWindow.getWindow()) {
    CheckUpdateWindow.sendStatusToWindow('versionUpdate', 'up to date')

    setTimeout(() => {
      MainWindow.createWindow()
      CheckUpdateWindow.getWindow().destroy()
    }, 3000)
  } else if (MainWindow.getWindow()) {
    MainWindow.getWindow().webContents.send('noUpdate')
  }
})

autoUpdater.on('error', () => {
  // Update Error
  if (CheckUpdateWindow.getWindow()) {
    CheckUpdateWindow.sendStatusToWindow('versionUpdate', 'oops! something went wrong')

    setTimeout(() => {
      CheckUpdateWindow.getWindow().destroy()
      app.exit()
    }, 5000)
  } else if (MainWindow.getWindow()) {
    MainWindow.getWindow().webContents.send('errorUpdate')
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  // download progress being downloaded
  if (CheckUpdateWindow.getWindow()) {
    CheckUpdateWindow.sendStatusToWindow('versionUpdate', `downloading... ${progressObj.percent.toFixed()}%`)
  } else if (MainWindow.getWindow()) {
    MainWindow.getWindow().webContents.send('progressUpdate', progressObj.percent.toFixed())
  }
})

autoUpdater.on('update-downloaded', (info) => {
  // Download completed
  if (CheckUpdateWindow.getWindow()) {
    this.sendStatusToWindow('versionUpdate', 'relaunching')

    setTimeout(() => {
      app.relaunch()
      app.exit()
    }, 3000)
  } else if (MainWindow.getWindow()) {
    MainWindow.getWindow().webContents.send('doneUpdate', info.version)
  }
})

/**
 * --------------------------------------------------------
 * Electron Main Remove Events
 * --------------------------------------------------------
 */

ipcMain.on('launch-monitor', (event, arg) => {
  if (!MonitorWindow.getWindow()) MonitorWindow.createWindow()
})

ipcMain.on('update-settings', (event, arg) => {
  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().webContents.send('updateSettings', arg)
})

ipcMain.on('update-task', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateTask', arg)
})

ipcMain.on('logout', async (event, arg) => {
  if (!LoginWindow.getWindow()) LoginWindow.createWindow()

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().destroy()

  if (MainWindow.getWindow()) MainWindow.getWindow().destroy()
})

ipcMain.on('login', (event, arg) => {
  initializeWindows()

  if (LoginWindow.getWindow()) LoginWindow.getWindow().destroy()
})

ipcMain.on('relaunch', (event, arg) => {
  app.relaunch()
  app.exit()
})

ipcMain.on('check-update', (event, arg) => {
  autoUpdater.checkForUpdatesAndNotify()
})
