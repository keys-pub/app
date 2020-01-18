import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import {createHashHistory} from 'history'
import {routerMiddleware} from 'connected-react-router'
import {createLogger} from 'redux-logger'
import createRootReducer from '../reducers'

import {ipcRenderer, remote} from 'electron'

import {initializeClient} from '../rpc/client'

import {init} from '../views/state'

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

  return store
}

const store = configureStore()

if (typeof module.hot !== 'undefined') {
  module.hot.accept('../reducers', () => store.replaceReducer(require('../reducers').default))
}

ipcRenderer.on('preferences', (event, message) => {
  // TODO: Show preferences
  // store.dispatch(push('/prefs/index'))
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

// Load credentials
ipcRenderer.on('credentials-loaded', (event, creds, protoPath) => {
  try {
    initializeClient(creds.certPath, creds.authToken, protoPath)
    setTimeout(() => {
      store.dispatch(init())
    }, 0)
  } catch (err) {
    alert('Error initializing client ' + err)
    remote.app.exit(3)
  }
})
ipcRenderer.send('credentials-load')

// ipcRenderer.on('start', (event, message) => {
//   console.log('App start')
//   store.dispatch(init())
// })

export {history, store}
