import * as getenv from 'getenv'

import {binPath} from './paths'
import {execProc, spawnProc} from './run'

export const getAppName = (): string => {
  return getenv.string('KP_APP')
}

const getPort = (): number => {
  return getenv.int('KP_PORT')
}

const getServicePath = (name: string): string => {
  return getenv.string('KP_CMD', binPath(name))
}

export const serviceStart = (name: string): Promise<{}> => {
  const path = getServicePath(name)
  if (!path) {
    return Promise.resolve({})
  }
  const appName = getAppName()
  const port = getPort()

  const arg = '--app=' + appName
  const start = 'start --from=app --port=' + port

  // This returns when the service is ready.
  return execProc(path, arg + ' ' + start)
}

export const serviceStop = (name: string): Promise<any> => {
  const path = getServicePath(name)
  if (path) {
    const appName = getAppName()
    const arg = '--app=' + appName
    return execProc(path, arg + ' stop')
  }
  return Promise.resolve()
}
