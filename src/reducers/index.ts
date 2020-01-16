import {combineReducers} from 'redux'

import app from './app'

import {reducer as rpc} from '../rpc/rpc'

import {connectRouter} from 'connected-react-router'

export default function createRootReducer(history: any) {
  return combineReducers<{}, any>({
    router: connectRouter(history),
    app,
    rpc,
  })
}
