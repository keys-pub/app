import {app, BrowserWindow} from 'electron'

export const reloadApp = (window: BrowserWindow) => {
  console.log('Reload!')
  if (process.env.NODE_ENV === 'development') {
    if (window) {
      window.webContents.reload()
    }
  } else {
    app.relaunch()
    app.exit(0)
  }
}
