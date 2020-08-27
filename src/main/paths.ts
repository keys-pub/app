import {app} from 'electron'
import * as path from 'path'
import * as os from 'os'
import {getAppName} from './env'
import * as fs from 'fs'

export const appResource = (file: string): string => {
  let resourcesPath = appResourcePath()
  const resource = path.join(resourcesPath, file)
  if (fs.existsSync(resource)) return resource
  return file
}

export const appResourcePath = (): string => {
  let resourcesPath = app.getAppPath()
  if (path.extname(resourcesPath) == '.asar') {
    resourcesPath = path.dirname(resourcesPath)
  }
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

export const updateApplyPath = (): string => {
  const resourcePath = appResourcePath()
  let applyPath
  switch (platform()) {
    case 'darwin':
      applyPath = path.resolve(resourcePath, '..', '..')
      break
    case 'win32':
      applyPath = path.resolve(resourcePath, '..')
      break
    default:
      throw new Error('unsupported platform')
  }
  console.log('Update apply path:', applyPath)
  return applyPath
}

// Path to an executable
export const binPath = (name: string): string => {
  const resourcesPath = appResourcePath()
  if (platform() == 'win32') {
    name = name + '.exe'
  }
  return path.join(resourcesPath, 'bin', name)
}
