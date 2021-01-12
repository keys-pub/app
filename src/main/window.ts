import {
  app,
  dialog,
  ipcMain,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItemConstructorOptions,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from 'electron'

import MenuBuilder from './menu'

import * as path from 'path'

const windowStateKeeper = require('electron-window-state')
import ElectronStore from 'electron-store'

import {MenuActionType} from './menu'

import {update, UpdateResult} from './updater'

import {reloadApp} from './app'

type ContextMenuProps = {
  labels: string[]
  x: number
  y: number
}

type ContextMenuSelected = {
  label?: string
  close?: boolean
}

export const createWindow = () => {
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

  let mainWindow: BrowserWindow | null = null

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
    ws.unmanage()
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

  mainWindow.on('move', () => {
    // TODO: This shouldn't be necessary
    ws.saveState()
  })

  const menuBuilder = new MenuBuilder(mainWindow, menuAction)
  menuBuilder.buildMenu()

  ipcMain.on('context-menu', (event, props: ContextMenuProps) => {
    const window = mainWindow
    if (!window) return
    const template: MenuItemConstructorOptions[] = props.labels.map((label: string) => {
      if (label == '-') {
        return {type: 'separator'}
      }
      return {
        label: label,
        click: () => {
          const out: ContextMenuSelected = {label}
          event.sender.send('context-menu', out)
        },
      }
    })

    if (process.env.NODE_ENV == 'development') {
      template.push(
        {type: 'separator'},
        {
          label: 'Inspect element',
          click: () => {
            window.webContents.inspectElement(props.x, props.y)
          },
        },
        {
          label: 'Reload',
          click: () => {
            reloadApp(window)
          },
        }
      )
    }

    var contextMenu = Menu.buildFromTemplate(template)
    contextMenu.popup({window: window})
    contextMenu.on('menu-will-close', (e: Event) => {
      const out: ContextMenuSelected = {close: true}
      event.sender.send('context-menu', out)
    })
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
}
