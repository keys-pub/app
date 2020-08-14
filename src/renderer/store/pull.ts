import {Store as PullStateStore} from 'pullstate'
import {Key, EncryptMode} from '../rpc/keys.d'

export type State = {
  error?: Error
  navMinimized: boolean
  selectedTool: string
  unlocked: boolean
  updating: boolean
}

export const Store = new PullStateStore<State>({
  navMinimized: false,
  selectedTool: 'encrypt',
  unlocked: false,
  updating: false,
})

export type EncryptState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  recipients: Key[]
  sender?: Key
  error?: Error
  loading: boolean
  // includeSelf?: boolean
}

export const EncryptStore = new PullStateStore<EncryptState>({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  recipients: [],
  loading: false,
})

export type DecryptState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  mode?: EncryptMode
  sender?: Key
  error?: Error
  loading: boolean
}

export const DecryptStore = new PullStateStore<DecryptState>({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  loading: false,
})

export type SignState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  signer?: Key
  error?: Error
  loading: boolean
}

export const SignStore = new PullStateStore<SignState>({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  loading: false,
})

export type VerifyState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  signer?: Key
  error?: Error
  loading: boolean
}

export const VerifyStore = new PullStateStore<VerifyState>({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  loading: false,
})

export enum WormholeMessageType {
  Sent = 1,
  Received = 2,
  Status = 3,
}

export type WormholeMessage = {
  id: string
  text: string
  severity?: string // "info", "error", "success"
  type: WormholeMessageType
  pending?: boolean
  link?: string
}

export type WormholeState = {
  sender: string
  recipient: string
  messages: WormholeMessage[]
}

export const WormholeStore = new PullStateStore<WormholeState>({
  sender: '',
  recipient: '',
  messages: [],
})
