// @flow
import {app} from 'electron'
import path from 'path'
import os from 'os'
import fs from 'fs'

// Path to resources directory
export const appResourcesPath = (): string => {
  if (os.platform() !== 'darwin') return '.'
  let resourcesPath = app.getAppPath()
  if (path.extname(resourcesPath) === '.asar') {
    resourcesPath = path.dirname(resourcesPath)
  }
  console.log('Resources path:', resourcesPath)
  return resourcesPath
}

// Path to an executable
export const binPath = (name: string): string => {
  if (os.platform() !== 'darwin') return name
  const resourcesPath = appResourcesPath()
  return path.resolve(resourcesPath, name)
}
