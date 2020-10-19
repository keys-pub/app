import {Store} from 'pullstate'

import {keys} from '../rpc/client'
import {Key} from '@keys-pub/tsclient/lib/keys.d'

type State = {
  fileIn: string
  fileOut: string
  input: string
  loading: boolean
  noSenderRecipient: boolean
  noSign: boolean
  output: string
  recipients: Key[]
  sender?: Key
}

const initialState: State = {
  fileIn: '',
  fileOut: '',
  input: '',
  loading: false,
  noSenderRecipient: false,
  noSign: false,
  output: '',
  recipients: [],
}

export const store = new Store(initialState)

export const loadStore = async () => {
  const configResp = await keys.ConfigGet({name: 'encrypt'})
  const config = configResp?.config?.encrypt

  const keysResp = await keys.Keys({})
  const recipients = (config?.recipients || [])
    .map((kid: string) => keysResp.keys?.find((k: Key) => k.id == kid))
    .filter((k?: Key) => k) as Key[]

  const sender = keysResp.keys?.find((k: Key) => k.id == config?.sender)

  store.update((s) => {
    s.recipients = recipients
    s.sender = sender
    s.noSign = !!config?.noSign
    s.noSenderRecipient = !!config?.noSenderRecipient
  })
}
