import * as getenv from 'getenv'

export const defaultAppName = 'Keys'
export const defaultPort = 22405

export const getAppName = (): string => {
  return getenv.string('KEYS_APP', defaultAppName)
}

export const getPort = (): number => {
  return getenv.int('KEYS_PORT', defaultPort)
}
