/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 */

import {app, BrowserWindow, ipcMain, BrowserWindowConstructorOptions} from 'electron'

import MenuBuilder from './menu'

import * as path from 'path'

const windowStateKeeper = require('electron-window-state')

import {MenuActionType} from './menu'

import {keysStart, keysStop} from './service'
import {update, UpdateResult} from './updater'

import {rpcRegister} from './rpc'
import {reloadApp} from './app'
import {appResource} from './paths'

let mainWindow: BrowserWindow | null = null

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  app.quit()
})

// app.on('web-contents-created', (event, contents) => {
//   contents.on('will-navigate', (event, navigationUrl) => {
//     const parsedUrl = new URL(navigationUrl)
//     console.log('Navigate:', navigationUrl)
//   })
// })

app.on('ready', async () => {
  let ws = windowStateKeeper({
    defaultWidth: 920,
    defaultHeight: 600,
  })

  let winOpts: BrowserWindowConstructorOptions = {
    show: false,
    x: ws.x,
    y: ws.y,
    width: ws.width,
    height: ws.height,
    minWidth: 920,
    minHeight: 600,
    // For AppImage icon
    icon: appResource(path.join('resources', 'icon.png')),

    webPreferences: {
      nodeIntegration: true,
      // devTools: false,
    },
  }

  if (process.platform == 'darwin') {
    winOpts.titleBarStyle = 'hidden'
  } else {
    winOpts.frame = false
  }

  // Read about Electron security here:
  // https://github.com/electron/electron/blob/master/docs/tutorial/security.md
  // TODO: Double check recommendations again
  mainWindow = new BrowserWindow(winOpts)

  ws.manage(mainWindow)

  if (process.env.NODE_ENV !== 'production') {
    // process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
    let port = process.env.DEV_PORT
    if (!port) {
      port = '2003'
    }
    console.log('Using dev port', port)
    mainWindow.loadURL(`http://localhost:` + port)
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuAction = (type: MenuActionType) => {
    if (!mainWindow) return
    switch (type) {
      case MenuActionType.Preferences:
        mainWindow.webContents.send('preferences')
        break
    }
  }

  mainWindow.on('focus', () => {
    if (!mainWindow) return
    mainWindow.webContents.send('focus')
  })

  mainWindow.on('blur', () => {
    if (!mainWindow) return
    mainWindow.webContents.send('blur')
  })

  mainWindow.on('responsive', () => {
    if (!mainWindow) return
    mainWindow.webContents.send('responsive')
  })

  mainWindow.on('unresponsive', () => {
    if (!mainWindow) return
    mainWindow.webContents.send('unresponsive')
  })

  const menuBuilder = new MenuBuilder(mainWindow, menuAction)
  menuBuilder.buildMenu()
})

app.on('quit', async () => {
  // TODO: stop keysd by default on app exit?
  if (process.env.KEYS_STOP_ON_EXIT) {
    await keysStop()
  }
})

ipcMain.removeAllListeners('reload-app')
ipcMain.on('reload-app', (event, arg) => {
  if (mainWindow) reloadApp(mainWindow)
})

ipcMain.removeAllListeners('keys-start')
ipcMain.on('keys-start', (event, arg) => {
  keysStart()
    .then(() => {
      console.log('Start...')
      rpcRegister()
      event.sender.send('keys-started')
    })
    .catch((err: Error) => {
      event.sender.send('keys-started', err)
    })
})

ipcMain.removeAllListeners('update-check')
ipcMain.on('update-check', (event, arg) => {
  update('', false)
    .then((res: UpdateResult) => {
      event.sender.send('update-needed', res.update)
    })
    .catch((err: Error) => {
      event.sender.send('update-check-err', err)
    })
})

ipcMain.removeAllListeners('update-apply')
ipcMain.on('update-apply', (event, arg) => {
  update('', true)
    .then((res: UpdateResult) => {
      console.log('Update (apply):', res)
      if (res.relaunch) {
        app.relaunch()
      }
      app.exit(0)
    })
    .catch((err: Error) => {
      event.sender.send('update-apply-err', err)
    })
})

ipcMain.removeAllListeners('update-force')
ipcMain.on('update-force', (event, arg) => {
  update('0.0.1', true)
    .then((res: UpdateResult) => {
      console.log('Update (apply):', res)
      if (res.relaunch) {
        app.relaunch()
      }
      app.exit(0)
    })
    .catch((err: Error) => {
      event.sender.send('update-apply-err', err)
    })
})
