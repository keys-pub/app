import {Store} from 'pullstate'

import {loadStore as keysLoadStore} from './keys/store'
import {loadStore as secretsLoadStore} from './secrets/store'
import {loadStore as encryptLoadStore} from './encrypt/store'
import {loadStore as signLoadStore} from './sign/store'

import {keys, creds} from './rpc/client'
import {SnackProps} from './components/snack'
import * as grpc from '@grpc/grpc-js'
import {ipcRenderer} from 'electron'
import {openSnackError} from './snack'

export interface Error {
  name: string
  message: string
  details?: string
  code?: number
}

export type State = {
  error?: Error
  ready: boolean
  unlocked: boolean
  updating: boolean

  location: string
  history: string[]

  navMinimized: boolean
  fido2Enabled: boolean

  snackOpen: boolean
  snack?: SnackProps
}

export const store = new Store<State>({
  ready: false,
  unlocked: false,
  updating: false,
  fido2Enabled: false,

  location: '',
  history: [],

  navMinimized: false,
  snackOpen: false,
})

export const loadStatus = async () => {
  const status = await keys.runtimeStatus({})
  store.update((s) => {
    s.fido2Enabled = !!status.fido2
  })
}

export const loadStore = async () => {
  const configResp = await keys.configGet({name: 'app'})
  const config = configResp?.config?.app
  // console.log('Config:', config)
  const location = config?.location || '/keys'
  const history = config?.history || ['/keys']

  store.update((s) => {
    s.location = location
    s.history = history
    s.navMinimized = !!config?.navMinimized
  })

  keysLoadStore()
  secretsLoadStore()
  encryptLoadStore()
  signLoadStore()
}

export const unlock = async (authToken?: string) => {
  if (!authToken) {
    throw new Error('no auth token')
  }
  creds.token = authToken
  await loadStore()
  store.update((s) => {
    s.unlocked = true
  })
}

export const lock = () => {
  creds.token = ''
  store.update((s) => {
    s.unlocked = false
  })
}

export const errored = (err: Error) => {
  // TODO: Special view for grpc unavailable
  console.error(err)

  switch (err.code) {
    case grpc.status.PERMISSION_DENIED:
    case grpc.status.UNAUTHENTICATED:
      console.log('Locking...')
      lock()
      openSnackError(err as Error)
      return
  }

  store.update((s) => {
    s.error = err
  })
}

export const setLocation = (location: string) => {
  console.log('Set location:', location)
  store.update((s) => {
    let history = [...s.history, location]
    if (history.length > 10) {
      history = history.slice(history.length - 10, history.length)
    }
    s.location = location
    s.history = history
  })
}

export const goBack = () => {
  store.update((s) => {
    let next = s.history
    if (s.history.length > 0) {
      next = s.history.slice(0, s.history.length - 1)
    }
    if (next.length > 0) {
      const location = next[next.length - 1]
      s.location = location
      s.history = [...next]
    }
  })
}

export const once = <A extends any[], R, T>(
  fn: (this: T, ...arg: A) => R
): ((this: T, ...arg: A) => R | undefined) => {
  let done = false
  return function (this: T, ...args: A) {
    return done ? void 0 : ((done = true), fn.apply(this, args))
  }
}
