/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 */

import {
  app,
  dialog,
  BrowserWindow,
  ipcMain,
  BrowserWindowConstructorOptions,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from 'electron'

import MenuBuilder from './menu'

import * as path from 'path'

const windowStateKeeper = require('electron-window-state')
import ElectronStore from 'electron-store'

import {MenuActionType} from './menu'

import {keysStart, keysStop} from './service'
import {update, UpdateResult} from './updater'

import {rpcRegister} from './rpc'
import {reloadApp} from './app'

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
    icon: path.join(__dirname, 'icon.png'),

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

  if (process.env.HOT) {
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

ipcMain.on('reload-app', (event, arg) => {
  if (mainWindow) {
    reloadApp(mainWindow)
  }
})

ipcMain.on('exit', (event, arg) => {
  app.exit(0)
})

ipcMain.on('toggle-dev-tools', (event, arg) => {
  if (mainWindow) {
    mainWindow.webContents.toggleDevTools()
  }
})

ipcMain.on('window-close', (event, arg) => {
  if (mainWindow) {
    mainWindow.close()
  }
})

ipcMain.on('window-minimize', (event, arg) => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.handle('window-maximize', (event, arg) => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    return mainWindow.isMaximized()
  }
  return false
})

ipcMain.handle('window-isMaximized', (event, arg) => {
  if (mainWindow) {
    return mainWindow.isMaximized()
  }
  return false
})

ipcMain.handle(
  'open-dialog',
  async (event, arg: OpenDialogOptions): Promise<OpenDialogReturnValue> => {
    if (mainWindow) {
      return await dialog.showOpenDialog(mainWindow, arg)
    }
    return {canceled: true, filePaths: []}
  }
)

ipcMain.handle('version', (event, arg) => {
  return app.getVersion()
})

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

ipcMain.on('update-check', (event, arg) => {
  update('', false)
    .then((res: UpdateResult) => {
      event.sender.send('update-needed', res.update)
    })
    .catch((err: Error) => {
      event.sender.send('update-check-err', err)
    })
})

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

ipcMain.handle('electron-store-get', (event, arg: string) => {
  const localStore = new ElectronStore()
  return localStore.get(arg)
})

ipcMain.on('electron-store-set', (event, arg: {key: string; value: string}) => {
  const localStore = new ElectronStore()
  if (!arg.key) return
  if (!arg.value) {
    localStore.delete(arg.key)
  } else {
    localStore.set(arg.key, arg.value)
  }
})
