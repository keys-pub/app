import {Store as PullStateStore} from 'pullstate'
import {Key, EncryptMode} from '../rpc/keys.d'

export type State = {
  selectedTool: string
}

export const Store = new PullStateStore({
  selectedTool: 'encrypt',
} as State)

export type DecryptState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  mode?: EncryptMode
  sender?: Key
  error?: string
  loading?: boolean
}

export const DecryptStore = new PullStateStore({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  error: '',
} as DecryptState)
