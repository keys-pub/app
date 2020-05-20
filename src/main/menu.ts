import {app, Menu, shell, BrowserWindow} from 'electron'
import {reloadApp} from './app'

export enum MenuActionType {
  Preferences,
}

export type MenuAction = (type: MenuActionType) => void

export default class MenuBuilder {
  mainWindow: BrowserWindow
  menuAction: MenuAction

  constructor(mainWindow: BrowserWindow, menuAction: MenuAction) {
    this.mainWindow = mainWindow
    this.menuAction = menuAction
  }

  buildMenu() {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment()
    }

    let template

    if (process.platform === 'darwin') {
      template = this.buildDarwinTemplate()
    } else {
      template = this.buildDefaultTemplate()
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    return menu
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.openDevTools()
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const {x, y} = props

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y)
          },
        },
        {
          label: 'Reload',
          click: () => {
            reloadApp(this.mainWindow)
          },
        },
      ]).popup({window: this.mainWindow})
    })
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Keys',
      submenu: [
        {label: 'About Keys', selector: 'orderFrontStandardAboutPanel:'},
        {type: 'separator'},
        {
          label: 'Preferences',
          accelerator: 'Command+,',
          click: () => {
            this.menuAction(MenuActionType.Preferences)
          },
        },
        {type: 'separator'},
        {label: 'Services', submenu: []},
        {type: 'separator'},
        {label: 'Hide Keys', accelerator: 'Command+H', selector: 'hide:'},
        {label: 'Hide Others', accelerator: 'Command+Shift+H', selector: 'hideOtherApplications:'},
        {label: 'Show All', selector: 'unhideAllApplications:'},
        {type: 'separator'},
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    }
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        {label: 'Undo', accelerator: 'Command+Z', selector: 'undo:'},
        {label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:'},
        {type: 'separator'},
        {label: 'Cut', accelerator: 'Command+X', selector: 'cut:'},
        {label: 'Copy', accelerator: 'Command+C', selector: 'copy:'},
        {label: 'Paste', accelerator: 'Command+V', selector: 'paste:'},
        {label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:'},
      ],
    }
    const subMenuView = {
      label: 'View',
      submenu: [
        {
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            this.mainWindow.webContents.reload()
          },
        },
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          },
        },
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools()
          },
        },
      ],
    }
    const subMenuWindow = {
      label: 'Window',
      submenu: [
        {label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:'},
        {label: 'Close', accelerator: 'Command+W', selector: 'performClose:'},
        {type: 'separator'},
        {label: 'Bring All to Front', selector: 'arrangeInFront:'},
      ],
    }
    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('http://keys.pub')
          },
        },
      ],
    }

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp]
  }

  buildDefaultTemplate() {
    const subMenuView = [
      {
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click: () => {
          this.mainWindow.webContents.reload()
        },
      },
      {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        },
      },
      {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click: () => {
          this.mainWindow.webContents.toggleDevTools()
        },
      },
    ]

    const templateDefault = [
      {
        label: '&View',
        submenu: subMenuView,
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('http://keys.pub')
            },
          },
        ],
      },
    ]

    return templateDefault
  }
}
