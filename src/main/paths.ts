import {app} from 'electron'
import * as path from 'path'
import * as os from 'os'
import {getAppName} from './env'

// Path to resources directory
export const appResourcesPath = (): string => {
  let resourcesPath = app.getAppPath()
  if (path.extname(resourcesPath) === '.asar') {
    resourcesPath = path.dirname(resourcesPath)
  }
  // console.log('Resources path:', resourcesPath)
  return resourcesPath
}

export const platform = (): NodeJS.Platform => {
  let platform = os.platform()
  if (process.env.KEYS_PLATFORM) {
    platform = process.env.KEYS_PLATFORM as NodeJS.Platform
  }
  return platform
}

export const appSupportPath = (): string => {
  const appName = getAppName()
  let supportDir
  switch (platform()) {
    case 'linux':
      if (process.env.XDG_DATA_HOME) {
        supportDir = process.env.XDG_DATA_HOME
      } else {
        const homeDir = os.homedir()
        supportDir = path.join(homeDir, '.local', 'share')
      }
      break
    case 'win32':
      if (process.env.LOCALAPPDATA) {
        supportDir = process.env.LOCALAPPDATA
      } else {
        const homeDir = os.homedir()
        supportDir = path.join(homeDir, 'AppData', 'Roaming')
      }
      break
    default:
      supportDir = app.getPath('appData')
      break
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
  if (platform() == 'win32') {
    name = name + '.exe'
  }
  return path.join(resourcesPath, 'bin', name)
}
