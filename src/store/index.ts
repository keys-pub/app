import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import {createHashHistory} from 'history'
import {push, routerActions, routerMiddleware} from 'connected-react-router'
import {createLogger} from 'redux-logger'
import createRootReducer from '../reducers'

import * as electron from 'electron'

const history = createHashHistory()
const rootReducer = createRootReducer(history)

const configureStore = (initialState?: any) => {
  // Redux Configuration
  const middleware = []
  const enhancers = []

  // Thunk Middleware
  middleware.push(thunk)

  const logger = createLogger({
    level: 'info',
    collapsed: true,
  })
  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger)
  }

  // Router Middleware
  const router = routerMiddleware(history)
  middleware.push(router)

  // Create Store
  const store = createStore(rootReducer, initialState, applyMiddleware(...middleware))

  // if (module.hot) {
  //   module.hot.accept('../reducers', () => store.replaceReducer(require('../reducers').default)) // eslint-disable-line global-require
  // }

  electron.ipcRenderer.on('preferences', (event, message) => {
    // TODO: Show preferences
    // store.dispatch(push('/prefs/index'))
  })

  electron.ipcRenderer.on('focus', (event, message) => {
    // store.dispatch({type: 'WINDOW_FOCUSED', payload: {focused: true}})
  })

  electron.ipcRenderer.on('blur', (event, message) => {
    // store.dispatch({type: 'WINDOW_FOCUSED', payload: {focused: false}})
  })

  electron.ipcRenderer.on('unresponsive', (event, message) => {
    store.dispatch({
      type: 'WINDOW_UNRESPONSIVE',
      payload: {
        unresponsive: true,
      },
    })
  })

  electron.ipcRenderer.on('responsive', (event, message) => {
    store.dispatch({
      type: 'WINDOW_UNRESPONSIVE',
      payload: {
        unresponsive: false,
      },
    })
  })

  // ipcRenderer.on('start', (event, message) => {
  //   console.log('App start')
  //   store.dispatch(init())
  // })

  return store
}

export {history}
export {configureStore}
