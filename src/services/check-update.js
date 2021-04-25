import { autoUpdater } from 'electron-updater'
import MainWindow from '@/windows/Main'
import log from 'electron-log'

export default {
  async start () {
    log.info('check update')

    try {
      autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      log.error(error)
    }

    autoUpdater.on('checking-for-update', () => {
      log.info('checking-for-update')
    })

    autoUpdater.on('update-available', () => {
      // version can be updated
      if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('newUpdate')
    })

    autoUpdater.on('update-not-available', () => {
      log.info('up to date')
      // no update available
      if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('noUpdate')
    })

    autoUpdater.on('error', () => {
      // Update Error
      if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('errorUpdate')
    })

    autoUpdater.on('download-progress', (progressObj) => {
      // download progress being downloaded
      if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('progressUpdate', progressObj.percent.toFixed())
    })

    autoUpdater.on('update-downloaded', () => {
      // Download completed
      if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('doneUpdate')
    })
  }
}
