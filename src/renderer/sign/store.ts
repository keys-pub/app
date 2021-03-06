import {rpc} from '../rpc/client'
import {Key} from '@keys-pub/tsclient/lib/rpc'
import {Store} from 'pullstate'
import {openSnackError} from '../snack'

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
  try {
    const configResp = await rpc.configGet({name: 'sign'})
    const config = configResp?.config?.sign

    const keysResp = await rpc.keys({query: config?.signer})
    const signer = keysResp.keys?.find((k: Key) => k.id == config?.signer)

    store.update((s) => {
      s.signer = signer
    })
  } catch (err) {
    openSnackError(err)
  }
}
