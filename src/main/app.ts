import {app, BrowserWindow} from 'electron'
import {close} from './rpc/client'

export const reloadApp = (window: BrowserWindow) => {
  console.log('Reload!')
  if (process.env.NODE_ENV === 'development') {
    close()
    if (window) {
      window.webContents.reload()
    }
  } else {
    app.relaunch()
    app.exit(0)
  }
}
