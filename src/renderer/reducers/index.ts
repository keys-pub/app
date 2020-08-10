import {combineReducers} from 'redux'

import app from './app'
import wormhole from './wormhole'

import {connectRouter} from 'connected-react-router'

export default function createRootReducer(history: any) {
  return combineReducers<{}, any>({
    router: connectRouter(history),
    app,
    wormhole,
  })
}
