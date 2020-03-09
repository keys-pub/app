import {goBack, push} from 'connected-react-router'

import * as grpc from '@grpc/grpc-js'

import * as queryString from 'query-string'

import {ipcRenderer} from 'electron'
import {setErrHandler} from '../rpc/rpc'
import {RPCError, WatchEvent} from '../rpc/types'
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

// export const errors = (err: Error) => (dispatch: (action: any) => any) => {
//   console.error('Dispatch', err)
//   dispatch({
//     type: 'ERROR',
//     payload: {error: err},
//   })
// }

// let watchCall
// export const startWatchStream = () => async (dispatch: (action: any) => any) => {
//   if (watchCall) {
//     console.warn('Watch call already on')
//     return
//   }
//   console.log('Start watch stream')
//   const syncStarted = new Date().getTime()
//   const cl = await client()
//   watchCall = cl.watch({})
//   watchCall.on('data', (event: WatchEvent) => {
//     console.log('Watch event:', event)
//     dispatch({type: 'WATCH_STATUS', payload: {status: event.status}})
//     // TODO: Update inbox
//   })
//   // watchCall.on('status', status => {
//   //   console.log('Watch stream status:', status)
//   // })
//   watchCall.on('end', () => {
//     watchCall = null
//     console.log('Watch stream end (duration: %sms)', new Date().getTime() - syncStarted)
//     // dispatch(errors(new Error('Watch stream ended')))
//     dispatch({type: 'WATCH_STATUS', payload: {status: 'OUTAGE'}})
//   })
//   watchCall.on('error', err => {
//     watchCall = null

//     if (err.code === grpc.status.PERMISSION_DENIED) {
//       console.error('Watch stream permission denied')
//       dispatch({type: 'LOCK'})
//       return
//     }

//     console.error('Watch stream error (duration: %sms): %s', new Date().getTime() - syncStarted, err)
//     dispatch(errors(err))
//   })
// }

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
