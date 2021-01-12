import {app, ipcMain} from 'electron'
import {serviceStart, serviceStop} from './service'
import {createWindow} from './window'

if (!process.env.KP_APP) {
  process.env.KP_APP = 'Keys'
}
if (!process.env.KP_PORT) {
  process.env.KP_PORT = '22405'
}

ipcMain.on('service-start', (event, arg) => {
  serviceStart('keys')
    .then(() => {
      console.log('Start...')
      event.sender.send('service-started')
    })
    .catch((err: Error) => {
      event.sender.send('service-started', err)
    })
})

app.on('ready', async () => {
  createWindow()
})

app.on('quit', async () => {
  // TODO: stop by default on app exit?
  if (process.env.KP_STOP_ON_EXIT) {
    await serviceStop('keys')
  }
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  app.quit()
})
