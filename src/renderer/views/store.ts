import {Store} from 'pullstate'

import {store as encryptStore, loadStore as encryptLoadStore} from './encrypt/store'
import {store as signStore, loadStore as signLoadStore} from './sign/store'

export interface Error {
  message: string
  details?: string
  code?: number
  name?: string
}

export type State = {
  error?: Error
  ready: boolean
  selectedTool: string
  unlocked: boolean
  updating: boolean
}

export const store = new Store<State>({
  ready: false,
  selectedTool: 'encrypt',
  unlocked: false,
  updating: false,
})

export const loadStore = () => {
  encryptLoadStore()
  signLoadStore()
}
