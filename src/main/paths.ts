import {app} from 'electron'
import * as path from 'path'
import * as os from 'os'

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
