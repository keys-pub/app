import {Store} from 'pullstate'

import {loadStore as keysLoadStore} from './keys/store'
import {loadStore as secretsLoadStore} from './secrets/store'
import {loadStore as encryptLoadStore} from './encrypt/store'
import {loadStore as signLoadStore} from './sign/store'

import {ipcRenderer} from 'electron'
import {configGet, keys} from './rpc/keys'
import {Key} from './rpc/keys.d'
import {SnackProps} from './components/snack'

export interface Error {
  message: string
  details?: string
  code?: number
  name?: string
}

export type State = {
  error?: Error
  ready: boolean
  unlocked: boolean
  updating: boolean

  location: string
  history: string[]

  navMinimized: boolean

  snackOpen: boolean
  snack?: SnackProps
}

export const store = new Store<State>({
  ready: false,
  unlocked: false,
  updating: false,

  location: '',
  history: [],

  navMinimized: false,
  snackOpen: false,
})

export const loadStore = async () => {
  const configResp = await configGet({name: 'app'})
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

export const unlocked = async (authToken?: string) => {
  if (!authToken) {
    throw new Error('no auth token')
  }
  ipcRenderer.send('authToken', {authToken})
  await loadStore()
  store.update((s) => {
    s.unlocked = true
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
