import {app, BrowserWindow} from 'electron'
import {rpcReload} from './rpc'

export const reloadApp = (window: BrowserWindow) => {
  console.log('Reload!')
  if (process.env.NODE_ENV === 'development') {
    rpcReload()
    if (window) {
      window.webContents.reload()
    }
  } else {
    app.relaunch()
    app.exit(0)
  }
}
