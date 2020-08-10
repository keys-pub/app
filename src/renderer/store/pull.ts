import {Store as PullStateStore} from 'pullstate'
import {Key, EncryptMode} from '../rpc/keys.d'

export type State = {
  selectedTool: string
}

export const Store = new PullStateStore({
  selectedTool: 'encrypt',
} as State)

export type EncryptState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  recipients: Key[]
  sender: Key
  error?: string
  loading?: boolean
  // includeSelf?: boolean
}

export const EncryptStore = new PullStateStore({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  recipients: [],
  sender: '',
  error: '',
} as EncryptState)

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

export type SignState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  signer: Key
  error?: string
  loading?: boolean
}

export const SignStore = new PullStateStore({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  signer: '',
  error: '',
} as SignState)

export type VerifyState = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  signer?: Key
  error?: string
  loading?: boolean
}

export const VerifyStore = new PullStateStore({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  error: '',
} as VerifyState)
