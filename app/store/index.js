// @flow
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
// $FlowFixMe
import {createHashHistory} from 'history'
import {push, routerActions, routerMiddleware} from 'connected-react-router'
import {createLogger} from 'redux-logger'
import createRootReducer from '../reducers'

import {ipcRenderer} from 'electron'

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

  // Redux DevTools Configuration
  const actionCreators = {...routerActions}
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        actionCreators,
      })
    : compose
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware))
  const enhancer = composeEnhancers(...enhancers)

  // Create Store
  const store = createStore<*, *, *>(rootReducer, initialState, enhancer)

  if (module.hot) {
    // $FlowFixMe
    module.hot.accept('../reducers', () => store.replaceReducer(require('../reducers').default)) // eslint-disable-line global-require
  }

  ipcRenderer.on('preferences', (event, message) => {
    store.dispatch(push('/profile/index'))
  })

  ipcRenderer.on('focus', (event, message) => {
    // store.dispatch({type: 'WINDOW_FOCUSED', payload: {focused: true}})
  })

  ipcRenderer.on('blur', (event, message) => {
    // store.dispatch({type: 'WINDOW_FOCUSED', payload: {focused: false}})
  })

  ipcRenderer.on('unresponsive', (event, message) => {
    store.dispatch({
      type: 'WINDOW_UNRESPONSIVE',
      payload: {
        unresponsive: true,
      },
    })
  })

  ipcRenderer.on('responsive', (event, message) => {
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
