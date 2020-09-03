import {binPath} from './paths'
import {execProc, spawnProc} from './run'
import {getAppName, getPort, defaultAppName, defaultPort} from './env'

const keysPath = (): string => {
  let path = ''
  if (process.env.NODE_ENV == 'production') {
    path = binPath('keys')
  }
  if (process.env.KEYS_BIN) {
    path = process.env.KEYS_BIN
  }
  console.log('Keys path:', path)
  return path
}

export const keysStart = (): Promise<any> => {
  const path = keysPath()
  if (!path) {
    return Promise.resolve()
  }
  const appName = getAppName()
  const port = getPort()

  let arg = ''
  if (appName != defaultAppName) {
    arg = '--app=' + appName
  }
  let start = 'start --from=app'
  if (port != defaultPort) {
    start = start + ' --port=' + port
  }

  // This returns when the service is ready.
  return execProc(path, arg + ' ' + start)
}

export const keysStop = (): Promise<any> => {
  const path = keysPath()
  if (path) {
    const appName = getAppName()
    let arg = ''
    if (appName != defaultAppName) {
      arg = '--app=' + appName
    }
    return execProc(path, arg + ' stop')
  }
  return Promise.resolve()
}

export const keysd = (): Promise<any> => {
  if (process.env.NODE_ENV === 'production') {
    const servicePath = binPath('keysd')
    return spawnProc(servicePath, '', true)
  }

  console.log('process.env.KEYSD', process.env.KEYSD_BIN)
  if (process.env.KEYSD_BIN) {
    return spawnProc(process.env.KEYSD_BIN, '', true)
  }

  console.warn('No service spawn in dev mode')
  return Promise.resolve()
}
