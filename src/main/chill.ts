import {app, ipcMain} from 'electron'
import getenv from 'getenv'
import {serviceStart, serviceStop} from './service'
import {createWindow} from './window'

if (!process.env.KP_APP) {
  process.env.KP_APP = 'Chill'
}
if (!process.env.KP_PORT) {
  process.env.KP_PORT = '12405'
}

app.on('ready', async () => {
  createWindow()
})

app.on('quit', async () => {
  await serviceStop('chill')
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  app.quit()
})

ipcMain.on('service-start', (event, arg) => {
  serviceStart('chill')
    .then(() => {
      console.log('Start...')
      event.sender.send('service-started')
    })
    .catch((err: Error) => {
      event.sender.send('service-started', err)
    })
})
