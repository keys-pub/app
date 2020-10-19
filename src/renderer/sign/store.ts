import {keys} from '../rpc/client'
import {Key} from '@keys-pub/tsclient/lib/keys.d'
import {Store} from 'pullstate'

type State = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  signer?: Key
  loading: boolean
}

export const store = new Store<State>({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  loading: false,
})

export const loadStore = async () => {
  const configResp = await keys.ConfigGet({name: 'sign'})
  const config = configResp?.config?.sign

  const keysResp = await keys.Keys({query: config?.signer})
  const signer = keysResp.keys?.find((k: Key) => k.id == config?.signer)

  store.update((s) => {
    s.signer = signer
  })
}
