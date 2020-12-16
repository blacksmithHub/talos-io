'use strict'

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

require('../server/index.js')

const isDevelopment = process.env.NODE_ENV !== 'production'
const puppeteer = require('puppeteer')
const proxyChain = require('proxy-chain')

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
    win = null
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

    setTimeout(() => {
      if (!MainWindow.getWindow()) {
        MainWindow.createWindow()
        win.destroy()
        win = null
      }
    }, 5000)
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

ipcMain.on('launch-proxies', (event, arg) => {
  if (!ProxyWindow.getWindow()) ProxyWindow.createWindow()
})

ipcMain.on('launch-setting', (event, arg) => {
  if (!SettingWindow.getWindow()) SettingWindow.createWindow()
})

ipcMain.on('update-settings', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateSettings', arg)

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().webContents.send('updateSettings', arg)

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().webContents.send('updateSettings', arg)

  if (ProxyWindow.getWindow()) ProxyWindow.getWindow().webContents.send('updateSettings', arg)
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

ipcMain.on('update-proxies', (event, arg) => {
  if (SettingWindow.getWindow()) SettingWindow.getWindow().webContents.send('updateProxies', arg)

  if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('updateProxies', arg)
})

ipcMain.on('clear-localStorage', (event, arg) => {
  if (MainWindow.getWindow()) MainWindow.getWindow().reload()

  if (MonitorWindow.getWindow()) MonitorWindow.getWindow().reload()

  if (SettingWindow.getWindow()) SettingWindow.getWindow().reload()

  if (ProfileWindow.getWindow()) ProfileWindow.getWindow().reload()

  if (ProxyWindow.getWindow()) ProxyWindow.getWindow().reload()
})

ipcMain.on('authenticate', (event, arg) => {
  if (!LoginWindow.getWindow()) LoginWindow.createWindow()

  MonitorWindow.closeWindow()
  ProfileWindow.closeWindow()
  ProxyWindow.closeWindow()
  SettingWindow.closeWindow()

  if (MainWindow.getWindow()) {
    MainWindow.getWindow().destroy()
    MainWindow.closeWindow()
  }
})

ipcMain.on('bind', (event, arg) => {
  initializeWindows()

  if (LoginWindow.getWindow()) {
    LoginWindow.getWindow().destroy()
    LoginWindow.closeWindow()
  }
})

/**
 * paypal checkout method
 */
ipcMain.on('pay-with-paypal', async (event, arg) => {
  const task = JSON.parse(arg).task
  const settings = JSON.parse(arg).settings

  let proxy = {}

  if (task.proxy && Object.keys(task.proxy).length) proxy = task.proxy.proxies[Math.floor(Math.random() * task.proxy.proxies.length)]

  const args = ['--window-size=800,600']

  if (Object.keys(proxy).length) {
    const oldProxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl)
    args.push(`--proxy-server=${newProxyUrl}`)
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: args,
    defaultViewport: null,
    executablePath: settings.executablePath || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  })

  const page = await browser.newPage()

  await page.setRequestInterception(true)

  page.on('request', (request) => {
    const url = request.url()
    const resourceType = request.resourceType()

    const filters = ['queue-it.net']

    const shouldAbort = filters.some((urlPart) => url.includes(urlPart))

    if (shouldAbort ||
      resourceType === 'media' ||
      url.endsWith('.png') ||
      url.endsWith('.gif') ||
      url.endsWith('.jpg')
    ) {
      request.abort()
    } else {
      request.continue()
    }
  })

  page.on('requestfinished', async (request) => {
    if (request.url() === 'https://www.titan22.com/rest/V1/carts/mine/payment-information') MainWindow.getWindow().webContents.send('updateTask', task)
  })

  await page.goto('https://www.titan22.com/customer/account/login/')
  await page.type('#email', task.profile.email)
  await page.type('#pass', task.profile.password)
  await page.click('#send2')
  await page.waitForNavigation()
  await page.goto('https://www.titan22.com/checkout/')
})

/**
 * 2c2p checkout method
 */
ipcMain.on('pay-with-2c2p', async (event, arg) => {
  const task = JSON.parse(arg).task
  const settings = JSON.parse(arg).settings

  let proxy = {}

  if (task.proxy && Object.keys(task.proxy).length) proxy = task.proxy.proxies[Math.floor(Math.random() * task.proxy.proxies.length)]

  const args = ['--window-size=800,600']

  if (Object.keys(proxy).length) {
    const oldProxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl)
    args.push(`--proxy-server=${newProxyUrl}`)
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: args,
    defaultViewport: null,
    executablePath: settings.executablePath || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  })

  const page = await browser.newPage()

  await page.setCookie({
    name: task.transactionData.cookies.name,
    value: task.transactionData.cookies.value,
    domain: task.transactionData.cookies.domain
  })

  await page.goto('https://t.2c2p.com/RedirectV3/Payment/Accept')

  const array = [
      `<p><strong>Task:</strong> ${task.name}</p>`,
      `<p><strong>Profile:</strong> ${task.profile.name}</p>`,
      `<p><strong>Product name:</strong> ${task.transactionData.order.name}</p>`,
      `<p><strong>Product SKU:</strong> ${task.transactionData.order.sku}</p>`,
      `<p><strong>Size:</strong> ${task.transactionData.order.sizeLabel}</p>`,
      `<p><strong>Price:</strong> ${task.transactionData.order.price.toLocaleString()}</p>`
  ]

  await page.waitForSelector('.navbar-inner')

  await page.evaluate((array) => {
    array.forEach(element => {
      var div = document.getElementsByClassName('navbar-inner')[0]
      div.insertAdjacentHTML('beforeend', element)
    })
  }, array)

  if (task.bank && Object.keys(task.bank).length) {
    switch (task.bank.bank.toLowerCase()) {
      case 'gcash':
        if (settings.autoPay || settings.autoFill) {
          await page.click('#btnGCashSubmit')
          await page.waitForNavigation()
          await page.waitForSelector('.layout-header')

          await page.evaluate((array) => {
            array.forEach(element => {
              var div = document.getElementsByClassName('layout-header')[0]
              div.insertAdjacentHTML('beforebegin', element)
            })
          }, array)

          await page.type('input[type=number]', task.bank.cardNumber)
          await page.click('.ap-button')
        }
        break

      default:
        if (settings.autoPay) {
          await page.type('#credit_card_number', task.bank.cardNumber)
          await page.type('#credit_card_holder_name', task.bank.cardHolder)
          await page.type('#credit_card_expiry_month', task.bank.expiryMonth)
          await page.type('#credit_card_expiry_year', task.bank.expiryYear)
          await page.type('#credit_card_cvv', task.bank.cvv)
          await page.type('#credit_card_issuing_bank_name', task.bank.bank)
          await page.click('#btnCCSubmit')
        } else if (settings.autoFill) {
          await page.type('#credit_card_number', task.bank.cardNumber)
          await page.type('#credit_card_holder_name', task.bank.cardHolder)
          await page.type('#credit_card_expiry_month', task.bank.expiryMonth)
          await page.type('#credit_card_expiry_year', task.bank.expiryYear)
          await page.type('#credit_card_cvv', task.bank.cvv)
          await page.type('#credit_card_issuing_bank_name', task.bank.bank)
        }
        break
    }
  }

  page.on('close', () => {
    MainWindow.getWindow().webContents.send('updateTask', task)
  })
})
