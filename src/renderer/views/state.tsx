import {goBack, push} from 'connected-react-router'

import * as grpc from '@grpc/grpc-js'

import * as queryString from 'query-string'

import {ipcRenderer} from 'electron'
import {setErrHandler} from '../rpc/keys'
import {RPCError} from '../rpc/keys.d'
import {store} from '../store'

export {goBack, push}

export const init = () => {
  setErrHandler((err: RPCError) => {
    if (err.code === grpc.status.PERMISSION_DENIED) {
      console.log('Permission denied, locking')
      store.dispatch({type: 'LOCK'})
    }
  })
  // dispatch(startWatchStream())
  store.dispatch(push('/keys/index'))
}

export const lock = () => {
  ipcRenderer.send('authToken', {authToken: ''})
  store.dispatch({type: 'LOCK'})
}

// TODO: Notify service of connectivity
// const onlineFn = () => {
//   console.log('Online')
// }
// const offlineFn = () => {
//   console.log('Offline')
// }
// window.addEventListener('online', onlineFn)
// window.addEventListener('offline', offlineFn)

export const query = (state: {router: any}, key: string): string => {
  const values = queryString.parse(state.router.location.search)
  return (values[key] || '').toString()
}
