// @flow
import {goBack, push} from 'connected-react-router'

import {client} from '../rpc/client'
import {status, setErrHandler} from '../rpc/rpc'

import grpc from 'grpc'

// import emoji from 'node-emoji'

import type {Key, KeyType, User} from '../rpc/types'

import type {StatusResponse, RPCError, RPCState, WatchEvent} from '../rpc/rpc'

import type {AppState} from '../reducers/app'

export type {AppState, RPCState}

export type State = {
  app: AppState,
  rpc: RPCState,
  router: any,
}

export {goBack, push}

export const init = () => (dispatch: (action: any) => void, getState: () => State) => {
  setErrHandler((err: RPCError, errFn: ?(err: RPCError) => void) => {
    if (err.code === grpc.status.PERMISSION_DENIED) {
      dispatch({type: 'LOCK'})
    } else if (!errFn) {
      dispatch(errors(new Error(err)))
    }
  })

  dispatch(
    status({}, (resp: StatusResponse) => {
      console.log('Status:', resp)
      if (!resp.key) {
        dispatch(push('/key/create'))
      } else {
        dispatch(startWatchStream())
        dispatch(push('/profile/index'))
      }
    })
  )
}

export const errors = (err: Error) => (dispatch: (action: any) => any) => {
  console.error('Dispatch', err)
  dispatch({
    type: 'ERROR',
    payload: {error: err},
  })
}

let watchCall
export const startWatchStream = () => async (dispatch: (action: any) => any) => {
  if (watchCall) {
    console.warn('Watch call already on')
    return
  }
  console.log('Start watch stream')
  const syncStarted = new Date().getTime()
  const cl = await client()
  watchCall = cl.watch({})
  watchCall.on('data', (event: WatchEvent) => {
    console.log('Watch event:', event)
    dispatch({type: 'WATCH_STATUS', payload: {status: event.status}})
    // TODO: Update inbox
  })
  // watchCall.on('status', status => {
  //   console.log('Watch stream status:', status)
  // })
  watchCall.on('end', () => {
    watchCall = null
    console.log('Watch stream end (duration: %sms)', new Date().getTime() - syncStarted)
    // dispatch(errors(new Error('Watch stream ended')))
    dispatch({type: 'WATCH_STATUS', payload: {status: 'OUTAGE'}})
  })
  watchCall.on('error', err => {
    watchCall = null
    console.error('Watch stream error (duration: %sms): %s', new Date().getTime() - syncStarted, err)
    dispatch(errors(err))
  })
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

export const statusEmpty = (): StatusResponse => ({
  uri: '',
  route: 'NO_ROUTE',
  key: keyEmpty(),
  promptPublish: false,
  promptUser: false,
})

export const keyEmpty = (): Key => ({
  kid: '',
  users: [],
  type: 'NO_KEY_TYPE',
  saved: false,
  createdAt: 0,
  publishedAt: 0,
  savedAt: 0,
  updatedAt: 0,
})

export const userEmpty = (): User => ({
  kid: '',
  seq: 0,
  service: '',
  name: '',
  url: '',
  err: '',
  verifiedAt: 0,
})

export const currentStatus = (rpc: RPCState): StatusResponse => {
  const status: StatusResponse = rpc.status ? rpc.status : statusEmpty()
  return status
}

export const currentKey = (rpc: RPCState): Key => {
  const status: StatusResponse = currentStatus(rpc)
  return status.key || keyEmpty()
}
