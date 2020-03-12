import {app} from 'electron'
import * as path from 'path'
import * as os from 'os'
import * as getenv from 'getenv'

// Path to resources directory
export const appResourcesPath = (): string => {
  let resourcesPath = app.getAppPath()
  if (path.extname(resourcesPath) === '.asar') {
    resourcesPath = path.dirname(resourcesPath)
  }
  console.log('Resources path:', resourcesPath)
  return resourcesPath
}

const getAppName = (): string => {
  return getenv.string('KEYS_APP', 'Keys')
}

export const appSupportPath = (): string => {
  const appName: string = getAppName()
  let supportDir
  if (os.platform() == 'linux') {
    if (process.env.XDG_DATA_HOME) {
      supportDir = process.env.XDG_DATA_HOME
    } else {
      const homeDir = os.homedir()
      supportDir = path.join(homeDir, '.local', 'share')
    }
  } else if (os.platform() == 'win32') {
    if (process.env.LOCALAPPDATA) {
      supportDir = process.env.LOCALAPPDATA
    } else {
      const homeDir = os.homedir()
      supportDir = path.join(homeDir, 'AppData', 'Roaming')
    }
  } else {
    supportDir = app.getPath('appData')
  }

  const p = path.join(supportDir, appName)
  console.log('App support path:', p)
  return p
}

// Path to app
export const appPath = (): string => {
  const resourcesPath = appResourcesPath()
  let appPath
  switch (os.platform()) {
    case 'darwin':
      appPath = path.resolve(resourcesPath, '..', '..')
      break
    case 'win32':
      appPath = path.resolve(resourcesPath, '..')
      break
    default:
      throw new Error('unsupported platform')
  }
  console.log('App path:', appPath)
  return appPath
}

// Path to an executable
export const binPath = (name: string): string => {
  const resourcesPath = appResourcesPath()
  if (os.platform() == "win32") {
    name = name + ".exe"
  }
  return path.join(resourcesPath, 'bin', name)
}
