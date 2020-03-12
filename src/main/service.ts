import {binPath} from './paths'
import {execProc, spawnProc} from './run'

const keysPath = (): string => {
  let path = ''
  if (process.env.NODE_ENV === 'production') {
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
  if (path) {
    return execProc(path + ' start --from=app')
  }
  return Promise.resolve()
}

export const keysStop = (): Promise<any> => {
  const path = keysPath()
  if (path) {
    return execProc(path + ' stop')
  }
  return Promise.resolve()
}

export const keysd = (): Promise<any> => {
  if (process.env.NODE_ENV === 'production') {
    const servicePath = binPath('keysd')
    return spawnProc(servicePath, true)
  }

  console.log('process.env.KEYSD', process.env.KEYSD_BIN)
  if (process.env.KEYSD_BIN) {
    return spawnProc(process.env.KEYSD_BIN, true)
  }

  console.warn('No service spawn in dev mode')
  return Promise.resolve()
}
