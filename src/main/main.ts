/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 */

import {app, BrowserWindow, ipcMain} from 'electron'

import MenuBuilder from './menu'

import * as getenv from 'getenv'
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

const windowStateKeeper = require('electron-window-state')

import {MenuActionType} from './menu'

import {keysStart} from './run'

import {autoUpdater} from 'electron-updater'

let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

// if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
//   require('electron-debug')
// }

// const installExtensions = () => {
//   const installer = require('electron-devtools-installer')
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS
//   const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
//   return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload))).catch(
//     console.log
//   )
// }

// TODO: On service crash handle restart if no stream request is active

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
  // if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  //   installExtensions()
  // }

  let ws = windowStateKeeper({
    defaultWidth: 920,
    defaultHeight: 600,
  })

  // Read about Electron security here:
  // https://github.com/electron/electron/blob/master/docs/tutorial/security.md
  // TODO: Double check recommendations again
  mainWindow = new BrowserWindow({
    show: false,
    x: ws.x,
    y: ws.y,
    width: ws.width,
    height: ws.height,
    minWidth: 920,
    minHeight: 600,
    titleBarStyle: 'hidden',
    webPreferences: {
      // TODO: Remove this
      nodeIntegration: true,
    },
  })

  ws.manage(mainWindow)

  if (process.env.NODE_ENV !== 'production') {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
    mainWindow.loadURL(`http://localhost:2003`)
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    )
  }

  ipcMain.on('restart-app', (event, arg) => {
    console.log('Restart!')
    if (process.env.NODE_ENV === 'development') {
      if (mainWindow) {
        mainWindow.webContents.reload()
      }
    } else {
      app.relaunch()
      app.exit(0)
    }
  })

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }

    // We start on credentials loaded in renderer process
    // mainWindow.webContents.send('start')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  autoUpdater.checkForUpdatesAndNotify()

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

ipcMain.on('keys-start', (event, arg) => {
  keysStart()
    .then(() => {
      event.sender.send('keys-started')
    })
    .catch((err: Error) => {
      event.sender.send('keys-started', err)
    })
})
