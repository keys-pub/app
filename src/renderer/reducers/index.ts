import {combineReducers} from 'redux'

import app from './app'
import decrypt from './decrypt'
import encrypt from './encrypt'
import sign from './sign'
import verify from './verify'
import wormhole from './wormhole'

import {connectRouter} from 'connected-react-router'

export default function createRootReducer(history: any) {
  return combineReducers<{}, any>({
    router: connectRouter(history),
    app,
    decrypt,
    encrypt,
    sign,
    verify,
    wormhole,
  })
}
