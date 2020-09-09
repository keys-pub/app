import {app, Menu, MenuItemConstructorOptions, shell, BrowserWindow} from 'electron'

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

    let template: MenuItemConstructorOptions[]

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
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
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
    } as MenuItemConstructorOptions

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
    } as MenuItemConstructorOptions

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
    } as MenuItemConstructorOptions

    const subMenuWindow = {
      label: 'Window',
      submenu: [
        {label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:'},
        {label: 'Close', accelerator: 'Command+W', selector: 'performClose:'},
        {type: 'separator'},
        {label: 'Bring All to Front', selector: 'arrangeInFront:'},
      ],
    } as MenuItemConstructorOptions

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://keys.pub')
          },
        },
      ],
    } as MenuItemConstructorOptions

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp]
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
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
              shell.openExternal('https://keys.pub')
            },
          },
        ],
      },
    ]

    return templateDefault
  }
}
