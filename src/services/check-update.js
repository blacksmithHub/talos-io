import { autoUpdater } from 'electron-updater'
import MainWindow from '@/windows/Main'

export default {
  async start () {
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('update-available', () => {
      // version can be updated
      if (MainWindow.getWindow()) MainWindow.getWindow().webContents.send('newUpdate')
    })

    autoUpdater.on('update-not-available', () => {
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
